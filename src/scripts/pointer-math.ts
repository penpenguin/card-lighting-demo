export type PointerInput = {
  clientX: number;
  clientY: number;
};

export type RectInput = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type MotionConfig = {
  tiltXMax: number;
  tiltYMax: number;
  translateMax: number;
  scaleHover: number;
};

export type PointerTarget = {
  mx: number;
  my: number;
  posx: number;
  posy: number;
  rx: number;
  ry: number;
  tx: number;
  ty: number;
  s: number;
  hyp: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const getPointerTarget = (
  pointer: PointerInput,
  rect: RectInput,
  config: MotionConfig,
): PointerTarget => {
  const x = (pointer.clientX - rect.left) / Math.max(1, rect.width);
  const y = (pointer.clientY - rect.top) / Math.max(1, rect.height);
  const clampedX = clamp01(x);
  const clampedY = clamp01(y);
  const dx = clampedX - 0.5;
  const dy = clampedY - 0.5;
  const hyp = Math.max(0.55, Math.min(1, Math.hypot(dx, dy) * 2));

  return {
    mx: clampedX * 100,
    my: clampedY * 100,
    posx: clampedX * 100,
    posy: clampedY * 100,
    rx: -(dy * config.tiltXMax),
    ry: dx * config.tiltYMax,
    tx: dx * config.translateMax,
    ty: dy * config.translateMax,
    s: config.scaleHover,
    hyp,
  };
};
