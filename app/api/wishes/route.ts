import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT, MAX_WISH_PER_USER } from "@/lib/config";
import { validateCreateWishPayload } from "@/lib/validation";
import { getWishStore } from "@/lib/wish-store";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nextToken = searchParams.get("nextToken") || undefined;
    const parsedLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), MAX_LIST_LIMIT)
      : DEFAULT_LIST_LIMIT;

    const store = getWishStore();
    const result = await store.listByStatus("active", limit, nextToken);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "服务器繁忙，请稍后重试", detail: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const input = validateCreateWishPayload(payload);
    const store = getWishStore();
    const count = await store.countByUserAndStatus(input.userId, "active");

    if (count >= MAX_WISH_PER_USER) {
      return NextResponse.json({ error: "您最多只能许3个愿望哦" }, { status: 403 });
    }

    const wish = await store.createWish(input);
    return NextResponse.json({ wish }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("必填") ||
        error.message.includes("不能超过") ||
        error.message.includes("非法"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message === "WISH_LIMIT_EXCEEDED") {
      return NextResponse.json({ error: "您最多只能许3个愿望哦" }, { status: 403 });
    }

    return NextResponse.json({ error: "服务器繁忙，请稍后重试", detail: String(error) }, { status: 500 });
  }
}
