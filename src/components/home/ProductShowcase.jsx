import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { products } from '../../data/products';

/* ============================================================
   PRODUCT SHOWCASE

   One reusable section template, six products. Copy lives in the
   DOM (selectable, translatable, reflows on mobile, CTAs actually
   navigate) and each product's artwork is a hand-built SVG scene
   from ./ProductVisuals — no raster mockups.

   Slides alternate `light` and `dark`, and `tone` drives both the
   section chrome and the visual, so a scene re-tones itself with
   no per-section overrides.

   From lg up the six slides are a STICKY STACK: each one pins to the
   viewport and the next scrolls up over it, so they deal like cards
   instead of scrolling past. Below lg they fall back to ordinary
   stacked sections — a pinned slide can't grow past 100vh, and the
   single-column phone layout needs the room.
   ============================================================ */

const tones = {
  light: {
    section: 'bg-page',
    badge: 'border-line bg-card text-brand-600',
    title: 'text-fg',
    accent: 'text-brand-600',
    body: 'text-fg-muted',
    cta: 'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-6px_rgba(102,154,247,0.55)]',
    statIcon: 'border-line bg-card text-brand-600',
    statTitle: 'text-fg',
    statText: 'text-fg-muted',
    divider: 'bg-line',
    glow: 'bg-brand-500/10',
  },
  dark: {
    section: 'bg-ink-950',
    badge: 'border-brand-500/45 bg-brand-500/10 text-brand-500',
    title: 'text-white',
    accent: 'text-brand-500',
    body: 'text-white/65',
    cta: 'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-6px_rgba(102,154,247,0.5)]',
    statIcon: 'border-brand-500/35 bg-brand-500/10 text-brand-500',
    statTitle: 'text-white',
    statText: 'text-white/60',
    divider: 'bg-white/15',
    glow: 'bg-brand-500/20',
  },
};

function ProductShowcase({ product, progress, index, last }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const t = tones[product.tone];
  const BadgeIcon = product.badge.icon;
  const Visual = product.Visual;

  /* How far this slide is through being covered by the next one: 0 the
     moment it pins, 1 when the next slide has fully taken the viewport.
     `progress` runs 0→1 across the whole stack, and every slide occupies
     exactly one screen of it, so the window is [i, i+1] / last. The final
     slide's window starts at 1 and is never entered — it is never covered. */
  const from = index / last;
  const to = (index + 1) / last;

  /* Callback form rather than useTransform(progress, [from, to], [...]).
     The array form lets Motion compile the value into a native
     ScrollTimeline animation, and those keyframe offsets have to land
     inside [0,1] — the final slide's window starts at 1 and runs past it,
     which throws outright. A callback can't be expressed as keyframes, so
     it stays on the JS path and reads the same progress the stack does. */
  const cover = () => {
    const p = progress.get();
    const c = Math.min(1, Math.max(0, (p - from) / (to - from)));

    /* Smoothstep. Linear cover makes the slide start receding the instant
       the scroll moves and stop dead when it lands — both ends read as a
       hinge. Easing the two ends flat lets it gather and settle instead. */
    return c * c * (3 - 2 * c);
  };

  const scale = useTransform(() => 1 - 0.06 * cover());
  const radius = useTransform(() => `${30 * cover()}px`);
  const dim = useTransform(() => 0.32 * cover());

  /* The copy and artwork drift up a little faster than the slide itself, so
     the layers separate as the slide goes under. Without it the whole plane
     recedes rigidly, which is the part that reads as "stiff". */
  const contentY = useTransform(() => `${-52 * cover()}px`);
  const contentFade = useTransform(() => 1 - 0.35 * cover());

  const depth = reduceMotion ? undefined : { scale, borderRadius: radius };

  return (
    <motion.section
      style={depth}
      /* The first showcase doubles as the `features` anchor — the navbar's
         Features link, its active-section observer, and the closing CTA's
         "Explore Features" button all scroll here. It has to be a real
         viewport-height section for the observer's ratio thresholds to fire,
         which is why the anchor isn't an empty wrapper div. */
      id={product.id}
      data-nav-tone={product.tone}
      data-nav-section="features"
      /* lg:snap-align-none is load-bearing: a pinned sticky element's snap
         box sits at the scrollport start for as long as it is pinned, so the
         browser would keep re-snapping to the slide you are trying to leave.
         The stack's snap stops are separate static markers instead (below). */
      className={`relative flex min-h-screen w-full snap-start items-center overflow-hidden px-4 pt-24 pb-10 sm:px-8 lg:sticky lg:top-0 lg:h-screen lg:snap-align-none lg:px-14 will-change-transform ${t.section}`}
    >
      {/* Top blend for light slides coming after dark */}
      {product.tone === 'light' && index === 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-48 bg-[linear-gradient(to_bottom,rgb(0,0,0)_0%,rgba(0,0,0,0.7)_20%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.12)_65%,rgba(0,0,0,0.03)_82%,transparent_100%)]"
        />
      )}
      {/* ambient wash behind the visual */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-[-10%] top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full blur-[60px] ${t.glow}`}
      />

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentFade }}
        className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14"
      >
        {/* ---------------- LEFT: copy ---------------- */}
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${t.badge}`}
          >
            <BadgeIcon size={14} strokeWidth={2} />
            {product.badge.label}
          </span>

          <h2
            className={`mt-6 text-[clamp(30px,3.6vw,50px)] font-extrabold leading-[1.08] tracking-[-0.025em] ${t.title}`}
          >
            {product.title}
            <br />
            <span className={t.accent}>{product.accent}</span>
          </h2>

          <p
            className={`mt-5 max-w-[46ch] text-[15px] leading-[1.65] sm:text-base ${t.body}`}
          >
            {product.body}
          </p>

          {/* actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <button
              onClick={() => navigate(product.cta.to ?? '/register')}
              className={`group inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${t.cta}`}
            >
              {product.cta.label}
              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>

            {/* Placeholder for future demo link */}
          </div>

          {/* stats */}
          <ul className={`mt-12 grid gap-5 ${product.stats.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
            {product.stats.map((stat) => {
              const StatIcon = stat.icon;

              return (
                <li key={stat.title}>
                  <span
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full border ${t.statIcon}`}
                  >
                    <StatIcon size={19} strokeWidth={1.9} />
                  </span>
                  <p className={`text-[13.5px] font-bold ${t.statTitle}`}>
                    {stat.title}
                  </p>
                  <p className={`mt-1 text-[12.5px] leading-[1.5] ${t.statText}`}>
                    {stat.text}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------------- RIGHT: product visual ---------------- */}
        <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
          <Visual tone={product.tone} />
        </div>
      </motion.div>

      {/* Shade the slide as it goes under the next one. Without this a
          covered slide stays at full brightness right up to the seam and
          the two read as one flat surface rather than as depth. */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 z-20 hidden bg-black lg:block"
        />
      )}
    </motion.section>
  );
}

export default function ProductShowcases() {
  const stackRef = useRef(null);

  /* One progress value for the whole stack, with each slide deriving its
     own share of it. Measuring a slide individually does not work: once a
     sticky element pins, its bounding box stops moving, so its own scroll
     progress freezes at exactly the moment the effect should start. */
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  });

  /* Scroll position is a step function — a wheel notch or a snap landing
     arrives as a jump, and anything bound straight to it jumps with it.
     Running it through a spring gives the depth transforms momentum: they
     trail the scroll slightly and glide into rest instead of stopping on
     the frame the scroll does.

     Only the *decoration* is smoothed. The pinning is real sticky layout
     and stays locked to the scroll, so nothing ever detaches from the
     finger — this adds flow without adding drift. */
  const flow = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
    restDelta: 0.0004,
  });

  const last = products.length - 1;

  return (
    /* bg-ink-950 is what shows through as a slide scales down and rounds
       off, so the retreat reads as a card lifting away rather than as a
       hole in the page. */
    <div
      /* The `features` anchor is the stack shell, not the first slide.
         A pinned sticky element already sits at the top of the viewport, so
         scrollIntoView on it is a no-op from anywhere inside the stack —
         "Features" in the navbar would silently do nothing once you were
         past slide one. The shell is static, so scrolling to it always
         lands on the top of the stack. */
      id="features"
      ref={stackRef}
      className="relative bg-ink-950"
    >
      {/* Snap stops for the stack. Zero-height, statically-boxed markers on
          each slide boundary — see the sticky note on the section above for
          why the slides can't carry the alignment themselves. */}
      {products.map((product, i) => (
        <div
          key={`stop-${product.id}`}
          aria-hidden="true"
          style={{ top: `${i * 100}vh` }}
          className="pointer-events-none absolute left-0 hidden h-px w-full snap-start lg:block"
        />
      ))}

      {products.map((product, i) => (
        <ProductShowcase
          key={product.id}
          product={product}
          progress={flow}
          index={i}
          last={last}
        />
      ))}
    </div>
  );
}
