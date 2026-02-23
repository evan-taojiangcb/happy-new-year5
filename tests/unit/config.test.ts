import { describe, expect, it } from "vitest";
import { CNY_COUNTDOWN_TARGET, CNY_RELEASE_TIME } from "@/lib/config";

describe("cny time config", () => {
  it("release is after countdown target", () => {
    expect(CNY_RELEASE_TIME.getTime()).toBeGreaterThan(CNY_COUNTDOWN_TARGET.getTime());
  });
});
