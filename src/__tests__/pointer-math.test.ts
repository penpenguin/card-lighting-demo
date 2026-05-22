import { describe, expect, it } from "vitest";
import { getPointerTarget } from "../scripts/pointer-math";

describe("カード基準のポインター座標", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  const motion = { tiltXMax: 18, tiltYMax: 22, translateMax: 18, scaleHover: 1.025 };

  it("viewportではなくカード矩形内の位置からCSS変数用の値を計算する", () => {
    const target = getPointerTarget({ clientX: 150, clientY: 75 }, rect, motion);

    expect(target.mx).toBe(25);
    expect(target.my).toBe(25);
    expect(target.posx).toBe(25);
    expect(target.posy).toBe(25);
    expect(target.rx).toBe(4.5);
    expect(target.ry).toBe(-5.5);
    expect(target.tx).toBe(-4.5);
    expect(target.ty).toBe(-4.5);
    expect(target.s).toBe(1.025);
    expect(target.hyp).toBeCloseTo(Math.hypot(-0.25, -0.25) * 2);
  });

  it("カード外の座標は0から1の範囲へ丸める", () => {
    const target = getPointerTarget({ clientX: 999, clientY: -20 }, rect, motion);

    expect(target.mx).toBe(100);
    expect(target.my).toBe(0);
    expect(target.rx).toBe(9);
    expect(target.ry).toBe(11);
    expect(target.hyp).toBe(1);
  });

  it("カード中心では淡い膜になりすぎない最低光量に抑える", () => {
    const target = getPointerTarget({ clientX: 200, clientY: 100 }, rect, motion);

    expect(target.mx).toBe(50);
    expect(target.my).toBe(50);
    expect(target.hyp).toBe(0.35);
  });
});
