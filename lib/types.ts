export type Gender = "male" | "female" | "secret";
export type WishStatus = "active" | "released";

export interface Wish {
  wishId: string;
  userId: string;
  nickname: string;
  content: string;
  contact?: string;
  gender: Gender;
  createdAt: number;
  status: WishStatus;
  ttl?: number;
}

export interface CreateWishInput {
  userId: string;
  nickname: string;
  content: string;
  contact?: string;
  gender: Gender;
}

export interface ListWishesResult {
  wishes: Wish[];
  nextToken: string | null;
}
