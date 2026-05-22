import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("npm project config", () => {
  it("sets the minimum release age to 3 days", () => {
    const npmrc = readFileSync(".npmrc", "utf-8");

    expect(npmrc).toMatch(/^min-release-age\s*=\s*3\s*$/m);
  });
});
