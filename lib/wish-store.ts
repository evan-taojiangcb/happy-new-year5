import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { MAX_WISH_PER_USER } from "./config";
import type { CreateWishInput, ListWishesResult, Wish, WishStatus } from "./types";

interface WishStore {
  listByStatus(status: WishStatus, limit: number, nextToken?: string): Promise<ListWishesResult>;
  countByUserAndStatus(userId: string, status: WishStatus): Promise<number>;
  createWish(input: CreateWishInput): Promise<Wish>;
  releaseAllActive(): Promise<number>;
}

function encodeToken(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeToken(token?: string): Record<string, unknown> | undefined {
  if (!token) return undefined;
  try {
    return JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    return undefined;
  }
}

class MemoryWishStore implements WishStore {
  private wishes: Wish[] = [];

  seed(seedWishes: Wish[]): void {
    this.wishes.push(...seedWishes);
  }

  async listByStatus(status: WishStatus, limit: number, nextToken?: string): Promise<ListWishesResult> {
    const sorted = this.wishes
      .filter((wish) => wish.status === status)
      .sort((a, b) => b.createdAt - a.createdAt || b.wishId.localeCompare(a.wishId));

    const token = decodeToken(nextToken);
    const startIndex = token?.wishId
      ? sorted.findIndex((w) => w.wishId === token.wishId) + 1
      : 0;

    const slice = sorted.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit);
    const last = slice.at(-1);

    return {
      wishes: slice,
      nextToken: last ? encodeToken({ wishId: last.wishId }) : null
    };
  }

  async countByUserAndStatus(userId: string, status: WishStatus): Promise<number> {
    return this.wishes.filter((wish) => wish.userId === userId && wish.status === status).length;
  }

  async createWish(input: CreateWishInput): Promise<Wish> {
    const count = await this.countByUserAndStatus(input.userId, "active");
    if (count >= MAX_WISH_PER_USER) {
      throw new Error("WISH_LIMIT_EXCEEDED");
    }

    const wish: Wish = {
      wishId: randomUUID(),
      userId: input.userId,
      nickname: input.nickname,
      content: input.content,
      contact: input.contact,
      gender: input.gender,
      createdAt: Date.now(),
      status: "active"
    };

    this.wishes.push(wish);
    return wish;
  }

  async releaseAllActive(): Promise<number> {
    let updated = 0;
    this.wishes = this.wishes.map((wish) => {
      if (wish.status === "active") {
        updated += 1;
        return { ...wish, status: "released" };
      }
      return wish;
    });
    return updated;
  }
}

class DynamoWishStore implements WishStore {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    this.tableName = process.env.DYNAMODB_TABLE || "Wishes";
    const region = process.env.REGION || process.env.AWS_REGION || "ap-northeast-1";
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
  }

  async listByStatus(status: WishStatus, limit: number, nextToken?: string): Promise<ListWishesResult> {
    const exclusiveStartKey = decodeToken(nextToken);
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "StatusCreatedAtIndex",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":status": status
        },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey
      })
    );

    return {
      wishes: (result.Items || []) as Wish[],
      nextToken: result.LastEvaluatedKey ? encodeToken(result.LastEvaluatedKey) : null
    };
  }

  async countByUserAndStatus(userId: string, status: WishStatus): Promise<number> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":status": status
        },
        Select: "COUNT"
      })
    );

    return result.Count || 0;
  }

  async createWish(input: CreateWishInput): Promise<Wish> {
    const count = await this.countByUserAndStatus(input.userId, "active");
    if (count >= MAX_WISH_PER_USER) {
      throw new Error("WISH_LIMIT_EXCEEDED");
    }

    const createdAt = Date.now();
    const ttl = Math.floor(createdAt / 1000) + 30 * 24 * 60 * 60;

    const wish: Wish = {
      wishId: randomUUID(),
      userId: input.userId,
      nickname: input.nickname,
      content: input.content,
      contact: input.contact,
      gender: input.gender,
      createdAt,
      status: "active",
      ttl
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: wish
      })
    );

    return wish;
  }

  async releaseAllActive(): Promise<number> {
    let releasedCount = 0;
    let lastKey: Record<string, unknown> | undefined;

    do {
      const scanRes = await this.client.send(
        new ScanCommand({
          TableName: this.tableName,
          ExclusiveStartKey: lastKey,
          FilterExpression: "#status = :status",
          ExpressionAttributeNames: {
            "#status": "status"
          },
          ExpressionAttributeValues: {
            ":status": "active"
          },
          ProjectionExpression: "wishId"
        })
      );

      for (const item of scanRes.Items || []) {
        if (!item.wishId) continue;
        await this.client.send(
          new UpdateCommand({
            TableName: this.tableName,
            Key: { wishId: item.wishId },
            UpdateExpression: "SET #status = :released",
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":released": "released"
            }
          })
        );
        releasedCount += 1;
      }

      lastKey = scanRes.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastKey);

    return releasedCount;
  }
}

let memoryStore: MemoryWishStore | undefined;

function getMemoryStore(): MemoryWishStore {
  if (!memoryStore) {
    memoryStore = new MemoryWishStore();
    seedMemoryStore(memoryStore);
  }
  return memoryStore;
}

function seedMemoryStore(store: MemoryWishStore): void {
  const now = Date.now();
  const demo: Array<Pick<Wish, "nickname" | "content" | "gender" | "contact">> = [
    { nickname: "小王同学", content: "希望2027年家人身体健康，万事如意！", gender: "secret" },
    { nickname: "Sunny", content: "求脱单！求桃花！", gender: "female" },
    { nickname: "李大力", content: "升职加薪，身体健康。", gender: "male" },
    { nickname: "Chen", content: "愿新的一年大家都平安喜乐。", gender: "secret" }
  ];
  const seeds: Wish[] = [];
  for (let i = 0; i < demo.length; i += 1) {
    const row = demo[i];
    seeds.push({
      wishId: randomUUID(),
      userId: `seed-${i}`,
      nickname: row.nickname,
      content: row.content,
      contact: row.contact,
      gender: row.gender,
      createdAt: now - i * 60 * 1000,
      status: "active"
    });
  }
  store.seed(seeds);
}

export function getWishStore(): WishStore {
  const preferMemory = (process.env.USE_IN_MEMORY_STORE || "true").toLowerCase() === "true";
  return preferMemory ? getMemoryStore() : new DynamoWishStore();
}
