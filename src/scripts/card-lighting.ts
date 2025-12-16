import { Pane } from "tweakpane";

const card = document.getElementById("card") as HTMLElement | null;
const paneHost = document.getElementById("pane-host") as HTMLElement | null;

if (card && paneHost) {
  const state = { rx: 0, ry: 0, mx: 50, my: 50, hover: 0, lightAngle: 0, lightStrength: 1 };
  const target = { rx: 0, ry: 0, mx: 50, my: 50, hover: 0, lightAngle: 0, lightStrength: 1 };
  const settings = {
    tiltX: 12,
    tiltY: 14,
    shineMax: 0.35,
    foilMax: 0.08,
    holoStrength: 0.65,
    prismStrength: 0.45,
    prismDensity: 6,
    lookPreset: "hybrid" as "standard" | "holo" | "parallel" | "hybrid",
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const prismCanvas = document.getElementById("prism-canvas") as HTMLCanvasElement | null;
  const prismCtx = prismCanvas?.getContext("2d") ?? null;

  const applySettings = () => {
    const preset = settings.lookPreset;
    const holoOn = preset === "holo" || preset === "hybrid";
    const prismOn = preset === "parallel" || preset === "hybrid";
    const effectiveHolo = holoOn ? 1 : 0;
    const effectivePrism = prismOn ? Math.max(settings.prismStrength, 1.2) : 0;

    card.style.setProperty("--tilt-x-max", settings.tiltX.toFixed(2));
    card.style.setProperty("--tilt-y-max", settings.tiltY.toFixed(2));
    card.style.setProperty("--shine-max", settings.shineMax.toFixed(3));
    card.style.setProperty("--foil-max", settings.foilMax.toFixed(3));
    card.style.setProperty("--holo-intensity", effectiveHolo.toString());
    card.style.setProperty("--holo-strength", settings.holoStrength.toFixed(2));
    card.style.setProperty("--prism-strength", effectivePrism.toFixed(2));
    card.style.setProperty("--prism-density", settings.prismDensity.toFixed(1));
  };

  const handlePointerMove = (event: PointerEvent) => {
    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);
    const x = event.clientX / vw;
    const y = event.clientY / vh;
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    target.ry = (clampedX - 0.5) * settings.tiltY;
    target.rx = -(clampedY - 0.5) * settings.tiltX;
    target.mx = clampedX * 100;
    target.my = clampedY * 100;
    target.hover = 1;

    const dx = clampedX - 0.5;
    const dy = clampedY - 0.5;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(0.65, Math.hypot(dx, dy));
    target.lightAngle = angle * (180 / Math.PI);
    target.lightStrength = 1 - dist / 0.65;
  };

  const handlePointerLeave = () => {
    target.rx = 0;
    target.ry = 0;
    target.hover = 0;
  };

  const resizePrism = () => {
    if (!prismCanvas || !prismCtx) return;
    const rect = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    prismCanvas.width = Math.round(rect.width * dpr);
    prismCanvas.height = Math.round(rect.height * dpr);
    prismCanvas.style.width = `${rect.width}px`;
    prismCanvas.style.height = `${rect.height}px`;
    prismCtx.setTransform(1, 0, 0, 1, 0, 0);
    prismCtx.scale(dpr, dpr);
  };

  const drawPrism = () => {
    if (!prismCtx || !prismCanvas) return;
    const rect = card.getBoundingClientRect();
    prismCtx.clearRect(0, 0, rect.width, rect.height);
    const stripeLen = Math.max(50, settings.prismDensity * 10);
    const stripeWid = Math.max(1.2, settings.prismDensity * 0.25);
    const lightX = (state.mx / 100) * rect.width;
    const lightY = (state.my / 100) * rect.height;
    const maxDist = Math.hypot(rect.width, rect.height) * 0.5;
    const step = settings.prismDensity * 8;

    for (let y = 0; y < rect.height + step; y += step) {
      for (let x = 0; x < rect.width + step; x += step) {
        const cx = x + (step * 0.3);
        const cy = y + (step * 0.7);
        const dist = Math.hypot(cx - lightX, cy - lightY);
        const normalized = 1 - Math.min(dist / maxDist, 1);
        if (normalized < 0.5) continue;
        const strength = normalized * state.lightStrength;
        const alpha = settings.prismStrength * (0.12 + 0.55 * strength) * (0.3 + 0.7 * state.hover);
        if (alpha <= 0.02) continue;

        prismCtx.save();
        prismCtx.translate(cx, cy);
        prismCtx.rotate(-Math.PI * 0.25);
        const grad = prismCtx.createLinearGradient(0, -stripeLen / 2, 0, stripeLen / 2);
        grad.addColorStop(0, `rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`);
        grad.addColorStop(0.35, `rgba(120,220,255,${(alpha * 0.9).toFixed(3)})`);
        grad.addColorStop(0.65, `rgba(255,180,220,${(alpha * 0.9).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`);
        prismCtx.fillStyle = grad;
        prismCtx.fillRect(-stripeWid / 2, -stripeLen / 2, stripeWid, stripeLen);
        prismCtx.restore();
      }
    }
  };

  const tick = () => {
    state.rx = lerp(state.rx, target.rx, 0.12);
    state.ry = lerp(state.ry, target.ry, 0.12);
    state.mx = lerp(state.mx, target.mx, 0.18);
    state.my = lerp(state.my, target.my, 0.18);
    state.hover = lerp(state.hover, target.hover, 0.18);
    state.lightAngle = lerp(state.lightAngle, target.lightAngle, 0.16);
    state.lightStrength = lerp(state.lightStrength, target.lightStrength, 0.2);

    card.style.setProperty("--rx", state.rx.toFixed(3) + "deg");
    card.style.setProperty("--ry", state.ry.toFixed(3) + "deg");
    card.style.setProperty("--mx", state.mx.toFixed(2) + "%");
    card.style.setProperty("--my", state.my.toFixed(2) + "%");
    card.style.setProperty("--hover", state.hover.toFixed(3));
    card.style.setProperty("--light-angle", state.lightAngle.toFixed(2) + "deg");
    card.style.setProperty("--light-strength", state.lightStrength.toFixed(3));

    drawPrism();
    requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("resize", resizePrism);

  const pane = new Pane({ title: "Lighting Controls", container: paneHost });
  pane
    .addBinding(settings, "tiltX", { min: 4, max: 24, step: 0.5, label: "Tilt X (deg)" })
    .on("change", applySettings);
  pane
    .addBinding(settings, "tiltY", { min: 4, max: 28, step: 0.5, label: "Tilt Y (deg)" })
    .on("change", applySettings);
  pane
    .addBinding(settings, "shineMax", { min: 0.05, max: 0.6, step: 0.01, label: "Shine max" })
    .on("change", applySettings);
  pane
    .addBinding(settings, "foilMax", { min: 0.02, max: 0.18, step: 0.005, label: "Foil max" })
    .on("change", applySettings);
  pane
    .addBinding(settings, "holoStrength", { min: 0.2, max: 1.2, step: 0.05, label: "Holo strength" })
    .on("change", applySettings);
  pane
    .addBinding(settings, "prismStrength", { min: 0.1, max: 1.4, step: 0.05, label: "Prism strength" })
    .on("change", applySettings);
  pane
    .addBinding(settings, "prismDensity", { min: 6, max: 20, step: 0.5, label: "Prism density" })
    .on("change", applySettings);
  pane.addBinding(settings, "lookPreset", {
    label: "Preset",
    options: {
      Standard: "standard",
      Holo: "holo",
      Parallel: "parallel",
      Hybrid: "hybrid",
    },
  }).on("change", applySettings);

  applySettings();
  resizePrism();
  requestAnimationFrame(tick);
}
