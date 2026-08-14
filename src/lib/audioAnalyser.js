/* Shared audio-reactivity bus.
 *
 * The hero's WebGL field needs the *live* amplitude of whatever the page is
 * playing, sampled once per animation frame. Routing that through React state
 * would re-render the tree 60x a second, so this module is deliberately a
 * mutable singleton: producers (an <audio> element) register here, consumers
 * (useFrame in a three.js scene) call getLevel() and never subscribe.
 *
 * WebAudio caveats this handles:
 *  - createMediaElementSource() may only be called ONCE per element. Calling it
 *    twice throws and permanently mutes the element, so sources are memoised in
 *    a WeakMap keyed by the element.
 *  - Once an element is routed through WebAudio it no longer reaches the
 *    speakers on its own; the graph must terminate at ctx.destination.
 *  - An AudioContext starts 'suspended' until a user gesture. resume() is
 *    therefore called from the click handler that also starts playback.
 */

let ctx = null;
let analyser = null;
let bins = null;

/** Elements already wired into the graph — see the createMediaElementSource caveat. */
const sources = new WeakMap();

/** Smoothed 0..1 amplitude. Read every frame by the hero shader. */
let level = 0;

/** True while an element registered here is actually playing. */
let active = false;

function supported() {
  return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
}

function ensureContext() {
  if (ctx || !supported()) return ctx;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  ctx = new AudioCtx();

  analyser = ctx.createAnalyser();
  /* 64 bins is plenty — we only want a loudness envelope, not a spectrum, and
     a small FFT keeps the per-frame copy cheap. */
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.8;
  analyser.connect(ctx.destination);

  bins = new Uint8Array(analyser.frequencyBinCount);

  return ctx;
}

/**
 * Route an <audio>/<video> element through the analyser.
 * Safe to call repeatedly with the same element.
 */
export function attach(el) {
  if (!el || !ensureContext()) return;

  if (!sources.has(el)) {
    try {
      const src = ctx.createMediaElementSource(el);
      src.connect(analyser);
      sources.set(el, src);
    } catch {
      /* Cross-origin media, or an element already claimed by another graph.
         Reactivity degrades to the idle animation; playback is unaffected. */
      return;
    }
  }

  el.addEventListener('playing', () => { active = true; });
  el.addEventListener('pause', () => { active = false; });
  el.addEventListener('ended', () => { active = false; });
}

/** Call from the same user gesture that starts playback. */
export function resume() {
  if (!ensureContext()) return;
  if (ctx.state === 'suspended') ctx.resume();
}

/**
 * Current amplitude, 0..1, sampled fresh. Falls off smoothly when audio stops
 * so the visual eases back to idle instead of snapping.
 */
export function getLevel() {
  if (!analyser) return 0;

  if (active) {
    analyser.getByteFrequencyData(bins);

    let sum = 0;
    for (let i = 0; i < bins.length; i++) sum += bins[i];

    const raw = sum / bins.length / 255;
    /* Attack fast, release slow — matches how a level meter reads to the eye. */
    level += (raw - level) * (raw > level ? 0.5 : 0.08);
  } else {
    level *= 0.94;
  }

  return level;
}

export function isSupported() {
  return supported();
}
