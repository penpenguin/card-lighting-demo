import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ポケモンカード風ホロ表現", () => {
  const page = readFileSync("src/pages/index.astro", "utf-8");
  const script = readFileSync("src/scripts/card-lighting.ts", "utf-8");
  const astroConfig = readFileSync("astro.config.mjs", "utf-8");

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

  it("トランスフォーム用のラッパーとCSS変数の受け皿がある", () => {
    ["card__translater", "card__rotator"].forEach((cls) => {
      expect(page).toContain(cls);
    });

    const vars = ["--mx", "--my", "--posx", "--posy", "--rx", "--ry", "--tx", "--ty", "--s", "--hyp"];
    vars.forEach((v) => expect(page).toContain(v));
  });

  it("カードの基礎レイヤーだけ残す", () => {
    ["layer-base", "layer-rim", "layer-shadow"].forEach((cls) => {
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

  it("GitHub Pages向けにbaseとsiteを環境変数で切り替える", () => {
    expect(astroConfig).toContain("BASE_PATH");
    expect(astroConfig).toContain("SITE_URL");
    expect(astroConfig).toContain("base:");
    expect(astroConfig).toContain("site:");
  });

  it("デフォルトのエフェクトはGildedにする", () => {
    expect(script).toContain('preset: "rare-secret"');
  });

  it("レアリティ名をエフェクト名に置き換える", () => {
    expect(script).toContain('title: "Effects & Motion"');
    expect(script).toContain('label: "Effect"');

    [
      "Holo Classic",
      "Galaxy Spark",
      "Prism Holo",
      "Prism Holo Max",
      "Prism Holo Star",
      "Ultra Gloss",
      "Ultra Gloss (Wide)",
      "Spectrum",
      "Gilded",
      "Radiant Burst",
      "Gallery Finish",
      "Gallery Finish (Deep)",
    ].forEach((label) => {
      expect(script).toContain(`"${label}"`);
    });

    [
      "Rare Holo",
      "Rare Holo Galaxy",
      "Rare Holo V",
      "Rare Holo VMAX",
      "Rare Holo VSTAR",
      "Rare Ultra (Pokémon)",
      "Rare Ultra (Supporter)",
      "Rare Rainbow",
      "Rare Secret",
      "Radiant",
      "Trainer Gallery",
      "Trainer Gallery V",
    ].forEach((label) => {
      expect(script).not.toContain(`"${label}"`);
    });
  });

  it("カード情報をTweakpaneから変更できる", () => {
    expect(script).toContain('addFolder({ title: "Card Details"');
    expect(script).toContain('addBinding(settings, "cardNumber"');
    expect(script).toContain('addBinding(settings, "cardHolder"');
    expect(script).toContain('addBinding(settings, "cardExpiry"');
    expect(script).toContain('querySelector(".holder")');
    expect(script).toContain('querySelector(".expiry__value")');
    expect(page).toContain('class="expiry__value"');
  });

  it("各エフェクトのCSSをdata-rarityセレクタで切り替える", () => {
    const selectors = [
      '[data-rarity="rare holo"] {',
      '[data-rarity="rare holo galaxy"] {',
      '[data-rarity*="rare holo v"] {',
      '[data-rarity="rare holo vmax"] {',
      '[data-rarity="rare holo vstar"][data-supertype="pokemon"] {',
      '[data-rarity="rare ultra"][data-supertype="pokemon"] {',
      '[data-rarity="rare ultra"][data-subtypes*="supporter"] {',
      '[data-rarity^="rare rainbow"] {',
      '[data-rarity="rare secret"] {',
      '[data-rarity*="radiant"] {',
      '[data-rarity="rare holo"][data-gallery="true"] {',
      '[data-rarity="rare holo v"][data-gallery="true"] {'
    ];

    selectors.forEach((sel) => expect(page).toContain(sel));
  });

  it("ギャラリーとサポーター用の分岐が含まれる", () => {
    expect(page).toContain('[data-subtypes*="supporter"]');
    expect(page).toContain('[data-gallery="true"]');
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

  it("カード番号を少し太くしてエフェクトが目立つようにする", () => {
    expect(page).toContain("number {\n\t\t\t\tposition: absolute;\n\t\t\t\tleft: var(--pan-center-x);\n\t\t\t\ttop: var(--pan-center-y);\n\t\t\t\ttransform: translate(-0.5ch, -50%);\n\t\t\t\tdisplay: inline-flex;\n\t\t\t\tgap: 18px;\n\t\t\t\tfont-size: 20px;\n\t\t\t\tletter-spacing: 0.18em;\n\t\t\t\tfont-weight: 800;");
  });

  it("ICチップの金属感を強める", () => {
    expect(page).toContain(".chip");
    expect(page).toContain("linear-gradient(135deg, #f2d58a");
    expect(page).toContain("border: 1px solid rgba(255, 232, 176");
  });

  it("ICチップの中心位置を規格比率に合わせる", () => {
    expect(page).toContain("--chip-center-x: 17.6%");
    expect(page).toContain("--chip-center-y: 44.3%");
    expect(page).toContain("position: absolute");
    expect(page).toContain("left: var(--chip-center-x)");
    expect(page).toContain("top: var(--chip-center-y)");
    expect(page).toContain("translate(-50%, -50%)");
  });

  it("エンボスの番号位置を規格比率に合わせる", () => {
    expect(page).toContain("--pan-center-x: 11.9%");
    expect(page).toContain("--pan-center-y: 60.7%");
    expect(page).toContain("left: var(--pan-center-x)");
    expect(page).toContain("top: var(--pan-center-y)");
    expect(page).toContain("translate(-0.5ch, -50%)");
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

  it("番号の配置に合わせて余白と並びを整える", () => {
    expect(page).toContain(".content");
    expect(page).toContain("gap: 10px");
    expect(page).toContain(".number");
    expect(page).toContain("padding: 0");
  });

  it("不要なサブタイトルとメタ情報を表示しない", () => {
    expect(page).not.toContain("Specular study");
    expect(page).not.toContain("CSS × Light × Tilt");
  });

  it("Premiumバッジを表示しない", () => {
    expect(page).not.toContain("Premium");
    expect(page).not.toContain(".badge");
  });

  it("VISTAロゴを表示しない", () => {
    expect(page).not.toContain("VISTA");
    expect(page).not.toContain(".network");
  });

  it("カード番号にもキラの影響を乗せる", () => {
    expect(page).toContain(".number span::after");
    expect(page).toContain("content: attr(data-digit)");
    expect(page).toContain("var(--pan-shine-bg");
    expect(page).toContain("var(--chip-shine-bg");
    expect(page).toContain("mix-blend-mode: normal");
  });

  it("カード番号の文字色を透明にしてエフェクトが透過する", () => {
    expect(page).toContain(".number { color: transparent;");
    expect(page).toContain("webkit-text-fill-color: transparent");
    expect(page).toContain(".number span { position: relative; display: inline-block; color: transparent;");
  });

  it("カードの縁が光に追従して輝く", () => {
    expect(page).toContain(".layer-rim");
    expect(page).toContain("var(--mx) var(--my)");
    expect(page).toContain("opacity: calc(var(--rim-glow-opacity, 0.24) + 0.6 * var(--hyp))");
    expect(page).toContain("padding: 1px");
    expect(page).toContain("radial-gradient(90% 90% at var(--mx) var(--my)");
    expect(page).toContain("mask-composite: exclude");
    expect(page).toContain("box-shadow: none");
    expect(page).toContain("filter: none");
    expect(page).toContain("layer-rim {\n\t\t\t\tinset: 0;\n\t\t\t\tborder-radius: var(--card-radius);\n\t\t\t\tbackground: radial-gradient");
  });

  it("レアリティに応じて縁の光の色味が変わる", () => {
    expect(page).toContain("--rim-glow-color-1");
    expect(page).toContain("--rim-glow-color-2");
    expect(page).toContain("--rim-glow-color-3");
    expect(page).toContain("--rim-glow-opacity");

    const rimBlocks = [
      String.raw`\[data-rarity="rare holo"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare holo galaxy"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity\*="rare holo v"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare holo vmax"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare holo vstar"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare ultra"\]\[data-supertype="pokemon"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare ultra"\]\[data-subtypes\*="supporter"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity\^="rare rainbow"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare secret"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity\*="radiant"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare holo"\]\[data-gallery="true"\][^}]*--rim-glow-color-1`,
      String.raw`\[data-rarity="rare holo v"\]\[data-gallery="true"\][^}]*--rim-glow-color-1`,
    ];

    rimBlocks.forEach((pattern) => {
      expect(page).toMatch(new RegExp(pattern));
    });
  });

  it("カードの縁の丸みを少し強める", () => {
    expect(page).toContain("--card-radius: 18px");
  });

  it("カード角の外側が黒くならないようレイヤーに丸みを継承する", () => {
    expect(page).toContain(".card__rotator {");
    expect(page).toContain("card__rotator {\n\t\t\t\tposition: absolute;\n\t\t\t\tinset: 0;\n\t\t\t\tborder-radius: var(--card-radius);");
  });

  it("不要なホロ系レイヤーと装飾を削除する", () => {
    [
      "card__shine",
      "card__glare",
      "card__frame",
      "card__cut",
      "layer-matte",
      "layer-coat",
      "layer-texture",
      "layer-foil",
      "layer-holo",
      "layer-prism",
      "layer-shine",
      "prism-canvas",
    ].forEach((name) => {
      expect(page).not.toContain(name);
    });
  });

});
