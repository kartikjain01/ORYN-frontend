import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play, Pause } from 'lucide-react';

import ConsoleOverlay from './ConsoleOverlay';
import { products } from '../../data/products';

/* ============================================================
   FEATURE CONSOLE

   The six tools are not a card grid. They are a signal chain —
   audio enters at the top, and every tool downstream of it acts
   on the same signal. So the panel is built as one: a wire with
   six taps, a playhead that travels it, and a stage that shows
   whatever the playhead is currently sitting on.

   The artwork is the same SVG scene each product uses on the home
   page (../home/ProductVisuals), so a tool looks identical in both
   places and there is no second set of assets to keep in sync.
   ============================================================ */

const STEP_MS = 5200;

/* Where the wire's fill should stop for a given tap. Rail items are equal
   height, so tap i sits at the centre of the i-th of n equal bands. */
const fillTo = index => ((2 * index + 1) / (2 * products.length)) * 100;

export default function FeatureConsole({ open, onClose }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [active, setActive] = useState(0);

  /* The chain plays itself until you touch it, then it is yours. It never
     resumes on its own — an interface that takes control back from a user
     who just took it is the single most irritating thing an autoplay
     carousel does. */
  const [playing, setPlaying] = useState(true);

  const railRef = useRef(null);

  useEffect(() => {
    if (!open || !playing || reduceMotion) return;

    const id = setInterval(
      () => setActive(current => (current + 1) % products.length),
      STEP_MS
    );

    return () => clearInterval(id);
  }, [open, playing, reduceMotion]);

  const select = index => {
    setActive(index);
    setPlaying(false);
  };

  /* Roving tabindex: the rail is one tab stop and the arrow keys move
     within it, which is how a listbox is expected to behave. Six separate
     tab stops in front of the stage would bury the main content. */
  const handleRailKey = event => {
    const keys = {
      ArrowDown: Math.min(products.length - 1, active + 1),
      ArrowUp: Math.max(0, active - 1),
      Home: 0,
      End: products.length - 1,
    };

    const next = keys[event.key];
    if (next === undefined) return;

    event.preventDefault();
    select(next);
    railRef.current?.querySelectorAll('button')[next]?.focus();
  };

  const product = products[active];
  const Visual = product.Visual;
  const BadgeIcon = product.badge.icon;

  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] };

  return (
    <ConsoleOverlay
      open={open}
      onClose={onClose}
      label="Platform features"
      eyebrow="ORYN — Signal chain"
    >
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[300px_1fr] lg:gap-12">
        {/* ================= RAIL ================= */}
        <div>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[32px]">
            One signal.
            <br />
            <span className="text-brand-500">Six instruments.</span>
          </h2>

          <p className="mt-3 max-w-[34ch] text-[13.5px] leading-[1.6] text-white/55">
            Audio enters once and every tool downstream works on the same
            signal — no exporting between apps, no quality lost in transit.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying(current => !current)}
              aria-label={playing ? 'Pause the chain' : 'Play the chain'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/70 transition hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              {playing && !reduceMotion ? (
                <Pause size={15} strokeWidth={2} />
              ) : (
                <Play size={15} strokeWidth={2} className="ml-0.5" />
              )}
            </button>

            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
              {String(active + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
            </span>
          </div>

          <ol
            ref={railRef}
            onKeyDown={handleRailKey}
            aria-label="Tools in the chain"
            className="relative mt-6"
          >
            {/* the wire */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[15px] top-0 w-px bg-white/[0.09]"
            />

            {/* signal travelling down it */}
            <motion.span
              aria-hidden="true"
              className="absolute left-[15px] top-0 w-px bg-gradient-to-b from-brand-500/20 via-brand-500/70 to-brand-500"
              animate={{ height: `${fillTo(active)}%` }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 180, damping: 26 }
              }
            />

            {products.map((item, index) => {
              const isActive = index === active;
              const isPassed = index <= active;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => select(index)}
                    tabIndex={isActive ? 0 : -1}
                    aria-current={isActive ? 'true' : undefined}
                    className="group flex w-full items-center gap-3 rounded-r-2xl py-[9px] pr-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  >
                    <span className="relative flex h-[31px] w-[31px] shrink-0 items-center justify-center">
                      {isActive && (
                        <motion.span
                          layoutId="chainPlayhead"
                          aria-hidden="true"
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 420, damping: 32 }
                          }
                          className="absolute inset-0 rounded-full border border-brand-500/55 bg-brand-500/15 shadow-[0_0_18px_rgba(102,154,247,0.45)]"
                        />
                      )}

                      <span
                        className={`relative h-[9px] w-[9px] rounded-full transition-colors duration-300 ${
                          isPassed ? 'bg-brand-500' : 'bg-white/25'
                        }`}
                      />
                    </span>

                    <span
                      className={`truncate text-[13.5px] font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-white'
                          : 'text-white/45 group-hover:text-white/80'
                      }`}
                    >
                      {item.badge.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ================= STAGE ================= */}
        <div className="min-w-0">
          {/* The artwork crossfades in place, so the two scenes are stacked
              absolutely inside a fixed-ratio box. Without the reserved ratio
              the panel would collapse to zero height on every swap. */}
          <div className="relative aspect-[720/470] w-full overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.02]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-[120px]"
            />

            <AnimatePresence initial={false}>
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.965 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.025 }}
                transition={fade}
                className="absolute inset-0 flex items-center justify-center p-4 sm:p-7"
              >
                <Visual tone="dark" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Copy swaps with mode="wait" so the two blocks never overlap and
              smear — they occupy the same flow position. */}
          <div className="mt-6 min-h-[190px] sm:min-h-[170px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-500">
                  <BadgeIcon size={13} strokeWidth={2} />
                  {product.badge.label}
                </span>

                <h3 className="mt-4 text-[24px] font-bold leading-[1.12] tracking-[-0.025em] text-white sm:text-[30px]">
                  {product.title}{' '}
                  <span className="text-brand-500">{product.accent}</span>
                </h3>

                <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-white/60">
                  {product.body}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {product.stats.map(stat => {
                    const StatIcon = stat.icon;

                    return (
                      <li
                        key={stat.title}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2.5 pr-3.5"
                      >
                        <StatIcon
                          size={14}
                          strokeWidth={1.9}
                          className="text-brand-500"
                        />
                        <span className="text-[12px] font-semibold text-white/85">
                          {stat.title}
                        </span>
                        <span className="text-[12px] text-white/40">
                          {stat.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12.5px] text-white/40">
              Six tools, one workspace. Nothing to install.
            </p>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(product.cta.to ?? '/register');
              }}
              className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-brand-500 px-7 text-[14.5px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(102,154,247,0.6)] transition duration-200 hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              {product.cta.label}
              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </ConsoleOverlay>
  );
}
