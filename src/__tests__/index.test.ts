import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ポケモンカード風ホロ表現", () => {
  const page = readFileSync("src/pages/index.astro", "utf-8");
  const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");

  it("カード本体は元のデモカードをそのまま描画する（iframeを使わない）", () => {
    expect(page).not.toContain("<iframe");
    expect(page).toContain("Card Lighting");
    expect(page).toContain("Specular study");
  });

  it("カード要素にdata-rarity等のデータ属性でレアリティを持たせる", () => {
    expect(page).toContain('class="card"');
    expect(page).toContain("data-rarity");
    expect(page).toContain("data-subtypes");
    expect(page).toContain("data-supertype");
  });

  it("ホロとグレア用のオーバーレイとCSS変数の受け皿がある", () => {
    ["card__shine", "card__glare", "card__translater", "card__rotator"].forEach((cls) => {
      expect(page).toContain(cls);
    });

    const vars = ["--mx", "--my", "--posx", "--posy", "--rx", "--ry", "--tx", "--ty", "--s", "--hyp"];
    vars.forEach((v) => expect(page).toContain(v));
  });

  it("元のレイヤー構造（base/texture/shine/foil/holo/rim/prismなど）が残っている", () => {
    ["layer-base", "layer-texture", "layer-shine", "layer-foil", "layer-holo", "layer-rim", "layer-prism", "layer-shadow"].forEach((cls) => {
      expect(page).toContain(cls);
    });
  });

  it("Tweakpaneでレアリティプリセットを切り替えられる", () => {
    expect(page).toContain("pane-host");
    expect(script).toContain('from "tweakpane"');
    expect(script).toContain("rarityPresets");
    expect(script).toContain("dataset.rarity");
    expect(script).toContain('addBinding(settings, "preset"');
  });

  it("各レアリティのCSSをdata-rarityセレクタで切り替える", () => {
    const selectors = [
      '[data-rarity="rare holo"] .card__shine',
      '[data-rarity="rare holo galaxy"] .card__shine',
      '[data-rarity="rare holo galaxy"] .card__glare',
      '[data-rarity*="rare holo v"] .card__shine',
      '[data-rarity="rare holo vmax"] .card__shine',
      '[data-rarity="rare holo vstar"][data-supertype="pokemon"] .card__shine',
      '[data-rarity="rare ultra"][data-supertype="pokemon"] .card__shine',
      '[data-rarity="rare ultra"][data-subtypes*="supporter"] .card__shine',
      '[data-rarity^="rare rainbow"] .card__shine',
      '[data-rarity="rare rainbow alt"] .card__shine',
      '[data-rarity="rare secret"] .card__shine',
      '[data-rarity*="radiant"] .card__shine',
      '[data-rarity="rare holo"][data-gallery="true"] .card__shine',
      '[data-rarity="rare holo v"][data-gallery="true"] .card__shine'
    ];

    selectors.forEach((sel) => expect(page).toContain(sel));
  });

  it("ステージやサポーター用のclip-pathやギャラリー条件が含まれる", () => {
    expect(page).toContain('[data-subtypes^="stage"]');
    expect(page).toContain('[data-subtypes^="supporter"]');
    expect(page).toContain('[data-gallery="true"]');
  });

  it("クレジットカード全面に近いホロ・グレア範囲を持つ", () => {
    expect(page).toContain('clip-path: inset(4.5% 4.5% 4.5% 4.5%)');
    expect(page).toContain("radial-gradient(320px 240px at var(--mx) var(--my)");
  });

  it("JSでポインター追従用CSS変数と距離係数--hypを更新する", () => {
    const vars = ["--mx", "--my", "--posx", "--posy", "--rx", "--ry", "--tx", "--ty", "--s", "--hyp"];
    vars.forEach((v) => expect(script).toContain(v));
    expect(script).toContain('window.addEventListener("pointermove"');
    expect(script).toContain('window.addEventListener("pointerleave"');
    expect(script).toContain("requestAnimationFrame");
  });
});
