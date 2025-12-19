import { Pane } from "tweakpane";

const card = document.getElementById("card") as HTMLElement | null;
const paneHost = document.getElementById("pane-host") as HTMLElement | null;

if (card) {
  const tiltXMax = 14;
  const tiltYMax = 16;
  const translateMax = 18;
  const scaleHover = 1.025;
  const cardNumberSpans = Array.from(card.querySelectorAll<HTMLSpanElement>(".number span"));
  const holderEl = card.querySelector(".holder") as HTMLElement | null;
  const expiryValueEl = card.querySelector(".expiry__value") as HTMLElement | null;

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
    { id: "rare-holo", label: "Holo Classic", rarity: "rare holo", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-holo-galaxy", label: "Galaxy Spark", rarity: "rare holo galaxy", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-holo-v", label: "Prism Holo", rarity: "rare holo v", supertype: "pokemon", subtypes: "v", gallery: false },
    { id: "rare-holo-vmax", label: "Prism Holo Max", rarity: "rare holo vmax", supertype: "pokemon", subtypes: "vmax", gallery: false },
    { id: "rare-holo-vstar", label: "Prism Holo Star", rarity: "rare holo vstar", supertype: "pokemon", subtypes: "vstar", gallery: false },
    { id: "rare-ultra", label: "Ultra Gloss", rarity: "rare ultra", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-ultra-supporter", label: "Ultra Gloss (Wide)", rarity: "rare ultra", supertype: "supporter", subtypes: "supporter", gallery: false },
    { id: "rare-rainbow", label: "Spectrum", rarity: "rare rainbow", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "rare-secret", label: "Gilded", rarity: "rare secret", supertype: "pokemon", subtypes: "basic", gallery: false },
    { id: "radiant", label: "Radiant Burst", rarity: "radiant", supertype: "pokemon", subtypes: "radiant", gallery: false },
    { id: "gallery", label: "Gallery Finish", rarity: "rare holo", supertype: "pokemon", subtypes: "basic", gallery: true },
    { id: "gallery-v", label: "Gallery Finish (Deep)", rarity: "rare holo v", supertype: "pokemon", subtypes: "vmax", gallery: true },
  ];

  const settings = {
    preset: "rare-secret",
    cardNumber: "5248 1903 7741 0826",
    cardHolder: "ALEXANDER NOVA",
    cardExpiry: "12/28",
  };

  const applyPreset = (id: string) => {
    const preset = rarityPresets.find((p) => p.id === id);
    if (!preset) return;
    card.dataset.rarity = preset.rarity;
    card.dataset.supertype = preset.supertype;
    card.dataset.subtypes = preset.subtypes;
    card.dataset.gallery = preset.gallery ? "true" : "false";
  };

  const splitCardNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return ["", "", "", ""];
    const chunks = trimmed.split(/\s+/).filter(Boolean);
    const groups = chunks.length > 1 ? chunks : (chunks[0]?.match(/.{1,4}/g) ?? []);
    while (groups.length < 4) groups.push("");
    return groups.slice(0, 4);
  };

  const applyCardDetails = () => {
    if (holderEl) holderEl.textContent = settings.cardHolder;
    if (expiryValueEl) expiryValueEl.textContent = settings.cardExpiry;
    if (!cardNumberSpans.length) return;
    const groups = splitCardNumber(settings.cardNumber);
    cardNumberSpans.forEach((span, index) => {
      const value = groups[index] ?? "";
      span.textContent = value;
      span.dataset.digit = value;
    });
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
  applyCardDetails();

  if (paneHost) {
    const pane = new Pane({ title: "Effects & Motion", container: paneHost });
    pane
      .addBinding(settings, "preset", {
        label: "Effect",
        options: Object.fromEntries(rarityPresets.map((p) => [p.label, p.id])),
      })
      .on("change", (ev) => {
        applyPreset(ev.value);
      });

    const details = pane.addFolder({ title: "Card Details" });
    details.addBinding(settings, "cardNumber", { label: "Number" }).on("change", applyCardDetails);
    details.addBinding(settings, "cardHolder", { label: "Name" }).on("change", applyCardDetails);
    details.addBinding(settings, "cardExpiry", { label: "Expiry" }).on("change", applyCardDetails);
  }

  requestAnimationFrame(tick);
}
