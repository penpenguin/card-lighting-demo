import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("トップページ", () => {
  it("サイトタイトルを表示する", () => {
    const content = readFileSync("src/pages/index.astro", "utf-8");
    expect(content).toContain('<h1 class="sr-only">Card Lighting Demo</h1>');
  });

  it("レイヤー構造とCSS変数でカードライティングを構成している", () => {
    const content = readFileSync("src/pages/index.astro", "utf-8");
    expect(content).toContain('class="stage"');
    expect(content).toContain('class="card"');
    expect(content).toContain("layer-base");
    expect(content).toContain("layer-texture");
    expect(content).toContain("layer-shine");
    expect(content).toContain("layer-foil");
    expect(content).toContain("layer-holo");
    expect(content).toContain("layer-rim");
    expect(content).toContain("layer-coat");
    expect(content).toContain("layer-prism");
    expect(content).toContain("layer-shadow");
    expect(content).toContain("--rx");
    expect(content).toContain("--ry");
    expect(content).toContain("--mx");
    expect(content).toContain("--my");
    expect(content).toContain("--holo-intensity");
    expect(content).toContain("--holo-strength");
    expect(content).toContain("--prism-strength");
    expect(content).toContain("--prism-density");
    expect(content).toContain("--light-angle");
    expect(content).toContain("--light-strength");
    expect(content).toContain("lookPreset");

    const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
    expect(script).toContain("requestAnimationFrame");
  });

  it("カードに触れなくても画面上のポインター位置で追従する", () => {
    const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
    expect(script).toContain('window.addEventListener("pointermove"');
    expect(script).toContain('window.addEventListener("pointerleave"');
    expect(script).not.toContain('card.addEventListener("pointermove"');
  });

  it("tweakpaneで調整パネルが用意されている", () => {
    const page = readFileSync("src/pages/index.astro", "utf-8");
    expect(page).toContain('card-lighting.ts');

    const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
    expect(script).toContain('from "tweakpane"');
    expect(script).toContain("new Pane");
    expect(script).toContain("holoStrength");
    expect(script).toContain("prismStrength");
    expect(script).toContain("prismDensity");
    expect(script).toContain("lightAngle");
    expect(script).toContain("lightStrength");
    expect(script).toContain("lookPreset");
  });

  it("ホログラフィックレア風モードを切り替えられる", () => {
    const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
    expect(script).toContain("--holo-intensity");
    expect(script).toContain("--holo-strength");
    expect(script).toContain("holoStrength");
  });

  it("パラレルレア風のプリズムバンドを調整できる", () => {
    const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
    expect(script).toContain("prismStrength");
    expect(script).toContain("--prism-strength");
    expect(script).toContain("prismDensity");
    expect(script).toContain("--prism-density");
  });

  it("プリセットでstandard/holo/parallel/hybridに切り替えられる", () => {
    const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
    expect(script).toContain("lookPreset");
    expect(script).toContain("Hybrid");
    expect(script).toContain("Standard");
  });
});
