import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ポケモンカード風ホロ表現", () => {
  const page = readFileSync("src/pages/index.astro", "utf-8");
  const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");

  it("カード本体は元のデモカードをそのまま描画する（iframeを使わない）", () => {
    expect(page).not.toContain("<iframe");
    expect(page).toContain("Card Lighting");
    expect(page).not.toContain("Specular study");
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

  it("ICチップ部分だけに透けるエフェクトを集約する", () => {
    expect(page).toContain('class="chip__shine"');
    expect(page).toContain(".chip__shine");
    expect(page).toContain("radial-gradient(120% 120% at var(--mx) var(--my)");
    expect(page).toContain(".card__shine");
    expect(page).toContain("opacity: 0;");
  });

  it("カード本体をマッドブラックに寄せる", () => {
    expect(page).toContain("background: #0a0a0a");
  });

  it("カードの影が見切れないようにステージを開放する", () => {
    expect(page).toContain(".stage");
    expect(page).toContain("overflow: visible");
  });

  it("カード番号の背景フレームを外す", () => {
    expect(page).toContain(".number");
    expect(page).toContain("background: none");
    expect(page).toContain("box-shadow: none");
  });

  it("ICチップの金属感を強める", () => {
    expect(page).toContain(".chip");
    expect(page).toContain("linear-gradient(135deg, #f2d58a");
    expect(page).toContain("border: 1px solid rgba(255, 232, 176");
  });

  it("ICチップの光沢がプリセットに追従する", () => {
    expect(page).toContain("var(--chip-shine-bg");
    expect(page).toContain("--chip-shine-bg");
    expect(page).toContain('data-rarity="rare holo"');
    expect(page).toContain('data-rarity="rare holo galaxy"');
  });

  it("背景をわずかに照らしてカードが浮かぶように見せる", () => {
    expect(page).toContain(".stage::after");
    expect(page).toContain("rgba(255, 240, 220, 0.08)");
  });

  it("メタ文言が見切れないよう余白を詰める", () => {
    expect(page).toContain(".content");
    expect(page).toContain("gap: 10px");
    expect(page).toContain(".number");
    expect(page).toContain("padding: 10px 12px");
  });

  it("不要なサブタイトルとメタ情報を表示しない", () => {
    expect(page).not.toContain("Specular study");
    expect(page).not.toContain("CSS × Light × Tilt");
  });

  it("radiantでもカード本体のきらきらを抑制する", () => {
    expect(page).toContain(".card[data-rarity] .card__shine");
    expect(page).toContain("opacity: 0;");
  });
});
