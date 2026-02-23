import { expect, test } from "@playwright/test";

test("首页可见并可打开许愿表单", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("除夕许愿墙")).toBeVisible();
  await page.getByRole("button", { name: "写愿望" }).click();
  await expect(page.getByText("写下新年愿望")).toBeVisible();
});
