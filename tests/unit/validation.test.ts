import { describe, expect, it } from "vitest";
import { escapeHtml, validateCreateWishPayload } from "@/lib/validation";

describe("escapeHtml", () => {
  it("escapes script tags", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toContain("&lt;script&gt;");
  });
});

describe("validateCreateWishPayload", () => {
  it("accepts valid payload", () => {
    const payload = validateCreateWishPayload({
      userId: "u1",
      nickname: "张三",
      content: "新年快乐",
      contact: "wx-001",
      gender: "male"
    });

    expect(payload.nickname).toBe("张三");
    expect(payload.gender).toBe("male");
  });

  it("rejects long content", () => {
    expect(() =>
      validateCreateWishPayload({
        userId: "u1",
        nickname: "张三",
        content: "a".repeat(201),
        contact: "",
        gender: "secret"
      })
    ).toThrow("愿望内容不能超过200字符");
  });
});
