import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("トップページ", () => {
  it("サイトタイトルを表示する", () => {
    const content = readFileSync("src/pages/index.astro", "utf-8");
    expect(content).toContain("<h1>Card Lighting Demo</h1>");
  });
});
