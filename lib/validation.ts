import type { CreateWishInput, Gender } from "./types";

const ALLOWED_GENDERS: Gender[] = ["male", "female", "secret"];

export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCreateWishPayload(payload: unknown): CreateWishInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("请求参数无效");
  }

  const obj = payload as Record<string, unknown>;
  const userId = asString(obj.userId);
  const nickname = asString(obj.nickname);
  const content = asString(obj.content);
  const contact = asString(obj.contact);
  const gender = asString(obj.gender) || "secret";

  if (!userId) throw new Error("userId 必填");
  if (!nickname) throw new Error("昵称必填");
  if (!content) throw new Error("愿望内容必填");
  if (!ALLOWED_GENDERS.includes(gender as Gender)) throw new Error("性别参数非法");
  if (nickname.length > 20) throw new Error("昵称不能超过20字符");
  if (content.length > 200) throw new Error("愿望内容不能超过200字符");
  if (contact.length > 100) throw new Error("联系方式不能超过100字符");

  return {
    userId: escapeHtml(userId),
    nickname: escapeHtml(nickname),
    content: escapeHtml(content),
    contact: contact ? escapeHtml(contact) : "",
    gender: gender as Gender
  };
}
