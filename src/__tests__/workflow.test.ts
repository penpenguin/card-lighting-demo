import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Actions workflows", () => {
  it("uses a Node.js version supported by Astro", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf-8");

    expect(workflow).toContain("actions/setup-node@v4");
    expect(workflow).toMatch(/node-version:\s*22\.12\.0\b/);
  });
});
