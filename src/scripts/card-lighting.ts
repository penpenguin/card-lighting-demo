import { Pane } from "tweakpane";

const card = document.getElementById("card") as HTMLElement | null;
const paneHost = document.getElementById("pane-host") as HTMLElement | null;

if (card) {
  const tiltXMax = 14;
  const tiltYMax = 16;
  const translateMax = 18;
  const scaleHover = 1.025;

  const state = {
    mx: 50,
    my: 50,
    posx: 50,
    posy: 50,
    rx: 0,
    ry: 0,
    tx: 0,
    ty: 0,
    s: 1,
    hyp: 0.5,
  };

  const target = { ...state };
  let lastPointerMove = performance.now();

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  type RarityPreset = {
    id: string;
    label: string;
    rarity: string;
    supertype: string;
    subtypes: string;
    gallery: boolean;
  };

  const rarityPresets: RarityPreset[] = [
    { id: "rare-holo", label: "Rare Holo", rarity: "rare holo", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-holo-stage", label: "Rare Holo (Stage)", rarity: "rare holo", supertype: "pokemon", subtypes: "stage2", gallery: false },
    { id: "rare-holo-galaxy", label: "Rare Holo Galaxy", rarity: "rare holo galaxy", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-holo-v", label: "Rare Holo V", rarity: "rare holo v", supertype: "pokemon", subtypes: "v", gallery: false },
    { id: "rare-holo-vmax", label: "Rare Holo VMAX", rarity: "rare holo vmax", supertype: "pokemon", subtypes: "vmax", gallery: false },
    { id: "rare-holo-vstar", label: "Rare Holo VSTAR", rarity: "rare holo vstar", supertype: "pokemon", subtypes: "vstar", gallery: false },
    { id: "rare-ultra", label: "Rare Ultra (Pokémon)", rarity: "rare ultra", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-ultra-supporter", label: "Rare Ultra (Supporter)", rarity: "rare ultra", supertype: "supporter", subtypes: "supporter", gallery: false },
    { id: "rare-rainbow", label: "Rare Rainbow", rarity: "rare rainbow", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-rainbow-alt", label: "Rare Rainbow Alt", rarity: "rare rainbow alt", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-secret", label: "Rare Secret", rarity: "rare secret", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "radiant", label: "Radiant", rarity: "radiant", supertype: "pokemon", subtypes: "radiant", gallery: false },
    { id: "gallery", label: "Trainer Gallery", rarity: "rare holo", supertype: "pokemon", subtypes: "basic", gallery: true },
    { id: "gallery-v", label: "Trainer Gallery V", rarity: "rare holo v", supertype: "pokemon", subtypes: "vmax", gallery: true },
  ];

  const settings = {
    preset: "rare-holo",
  };

  const applyPreset = (id: string) => {
    const preset = rarityPresets.find((p) => p.id === id);
    if (!preset) return;
    card.dataset.rarity = preset.rarity;
    card.dataset.supertype = preset.supertype;
    card.dataset.subtypes = preset.subtypes;
    card.dataset.gallery = preset.gallery ? "true" : "false";
  };

  const applyVars = () => {
    card.style.setProperty("--mx", state.mx.toFixed(2) + "%");
    card.style.setProperty("--my", state.my.toFixed(2) + "%");
    card.style.setProperty("--posx", state.posx.toFixed(2) + "%");
    card.style.setProperty("--posy", state.posy.toFixed(2) + "%");
    card.style.setProperty("--rx", state.rx.toFixed(3) + "deg");
    card.style.setProperty("--ry", state.ry.toFixed(3) + "deg");
    card.style.setProperty("--tx", state.tx.toFixed(2) + "px");
    card.style.setProperty("--ty", state.ty.toFixed(2) + "px");
    card.style.setProperty("--s", state.s.toFixed(3));
    card.style.setProperty("--hyp", state.hyp.toFixed(3));
  };

  const handlePointerMove = (event: PointerEvent) => {
    lastPointerMove = performance.now();
    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);
    const x = event.clientX / vw;
    const y = event.clientY / vh;
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    const dx = clampedX - 0.5;
    const dy = clampedY - 0.5;
    const hyp = Math.min(1, Math.hypot(dx, dy) * 2);

    target.mx = clampedX * 100;
    target.my = clampedY * 100;
    target.posx = clampedX * 100;
    target.posy = clampedY * 100;
    target.rx = -(dy * tiltXMax);
    target.ry = dx * tiltYMax;
    target.tx = dx * translateMax;
    target.ty = dy * translateMax;
    target.s = scaleHover;
    target.hyp = hyp;
  };

  const handlePointerLeave = () => {
    lastPointerMove = performance.now();
    target.mx = 50;
    target.my = 50;
    target.posx = 50;
    target.posy = 50;
    target.rx = 0;
    target.ry = 0;
    target.tx = 0;
    target.ty = 0;
    target.s = 1;
    target.hyp = 0.5;
  };

  const idleOrbit = (time: number) => {
    const t = time * 0.001;
    const wobble = 0.22;
    target.ry = Math.sin(t * 0.6) * tiltYMax * 0.24;
    target.rx = Math.cos(t * 0.5) * tiltXMax * 0.22;
    target.mx = (Math.sin(t * 0.55) * wobble + 0.5) * 100;
    target.my = (Math.cos(t * 0.58) * wobble + 0.5) * 100;
    target.posx = target.mx;
    target.posy = target.my;
    target.tx = (target.mx - 50) * 0.36;
    target.ty = (target.my - 50) * 0.36;
    target.s = 1.01;
    const dx = target.mx / 100 - 0.5;
    const dy = target.my / 100 - 0.5;
    target.hyp = Math.min(1, Math.hypot(dx, dy) * 2);
  };

  const tick = () => {
    const now = performance.now();
    if (now - lastPointerMove > 1400) {
      idleOrbit(now);
    }

    state.mx = lerp(state.mx, target.mx, 0.16);
    state.my = lerp(state.my, target.my, 0.16);
    state.posx = lerp(state.posx, target.posx, 0.15);
    state.posy = lerp(state.posy, target.posy, 0.15);
    state.rx = lerp(state.rx, target.rx, 0.12);
    state.ry = lerp(state.ry, target.ry, 0.12);
    state.tx = lerp(state.tx, target.tx, 0.16);
    state.ty = lerp(state.ty, target.ty, 0.16);
    state.s = lerp(state.s, target.s, 0.12);
    state.hyp = lerp(state.hyp, target.hyp, 0.1);

    applyVars();
    requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", handlePointerLeave);
  applyPreset(settings.preset);

  if (paneHost) {
    const pane = new Pane({ title: "Rarity & Motion", container: paneHost });
    pane
      .addBinding(settings, "preset", {
        label: "Rarity",
        options: Object.fromEntries(rarityPresets.map((p) => [p.label, p.id])),
      })
      .on("change", (ev) => {
        applyPreset(ev.value);
      });
  }

  requestAnimationFrame(tick);
}
