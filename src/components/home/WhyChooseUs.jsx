import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

import globe from '../../assets/images/why-choose-us-globe.png';

/* ============================================================
   WHY CHOOSE US

   Copy left, globe right. The artwork carries its own proof
   points — reliability, countries, creators, voices — as cards
   orbiting the globe, so the DOM sets them up rather than
   repeating them.

   The image sits on the page with no card, border or shadow, and
   that is deliberate: its own background samples at
   rgb(242,245,252), within five units of --color-page (#f7f9fc).
   Framing it would draw a rectangle around something that is
   already seamless. The earlier dark render needed a container
   precisely because it *wasn't* seamless — it read as a black
   slab dropped onto a white page.

   Height is clamped against the viewport, not derived from width.
   This section is one slide in a deck with roughly `100vh - 8rem`
   to live in, and sizing off width is how every earlier version
   of it overflowed on short screens.
   ============================================================ */

/* The image is informative, not decorative: these numbers exist only inside
   the PNG, so without this they exist for nobody using a screen reader. */
const IMAGE_ALT =
  'ORYN at a glance: 99.9% reliability, 120+ countries served, 10,000+ creators, and 90 million+ voices generated.';

export default function WhyChooseUs() {
  const reduceMotion = useReducedMotion();

  const rise = delay => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section
      id="why-choose-us"
      className="relative w-full px-4 py-6 sm:px-8 lg:px-14"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
        {/* ---------------- LEFT: copy ---------------- */}
        <div>
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:text-[11.5px]"
          >
            <Sparkles size={14} strokeWidth={2.2} />
            Why Choose ORYN
          </motion.span>

          <motion.h2
            {...rise(0.06)}
            className="mt-6 text-[clamp(30px,3.6vw,50px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-fg"
          >
            Built for Creators.
            <br />
            <span className="text-brand-600">Trusted</span> Worldwide.
          </motion.h2>

          <motion.span
            {...rise(0.1)}
            aria-hidden="true"
            className="mt-6 block h-[3px] w-12 rounded-full bg-brand-600"
          />

          <motion.p
            {...rise(0.14)}
            className="mt-6 max-w-[44ch] text-[14.5px] leading-[1.75] text-fg-muted sm:text-base"
          >
            ORYN combines advanced AI with a creator-first approach to deliver
            unmatched quality, speed, and reliability you can count on.
          </motion.p>

          <motion.div {...rise(0.18)} className="mt-8">
            <button
              type="button"
              onClick={() =>
                document.getElementById('impact')?.scrollIntoView({
                  behavior: reduceMotion ? 'auto' : 'smooth',
                  block: 'start',
                })
              }
              className="group inline-flex items-center gap-4 rounded-full border border-line bg-card py-2 pl-2 pr-7 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-10px_rgba(16,24,40,0.18)] transition duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_38px_-10px_rgba(37,99,235,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.6)]">
                <ArrowRight
                  size={20}
                  strokeWidth={2.2}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>

              <span className="text-[15px] font-semibold text-fg">
                See Our Impact
              </span>
            </button>
          </motion.div>
        </div>

        {/* ---------------- RIGHT: globe ---------------- */}
        <motion.div {...rise(0.1)}>
          <img
            src={globe}
            width={958}
            height={1006}
            alt={IMAGE_ALT}
            loading="lazy"
            decoding="async"
            className="mx-auto h-[clamp(260px,50vh,540px)] w-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
