import { useNavigate } from 'react-router-dom';
import { Globe2, Gauge, ShieldCheck, ArrowRight } from 'lucide-react';
import earth from '../../assets/images/earth.webp';

const pills = [
  {
    icon: Globe2,
    title: 'Global Community',
    text: '50K+ creators worldwide',
  },
  {
    icon: Gauge,
    title: 'High Performance',
    text: 'Sub-second generation',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Platform',
    text: 'Your data stays yours',
  },
];

export default function CtaBanner() {
  const navigate = useNavigate();


  return (
    <section className="relative px-4 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative isolate overflow-hidden
            rounded-[28px] bg-ink-950
            px-6 py-10 sm:px-10 sm:py-14 lg:px-14
            lg:min-h-[380px] lg:flex lg:items-center
          "
        >
          {/* ---------- FULL-BLEED EARTH ---------- */}
          <img
            src={earth}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-right"
          />

          {/* Scrim: keeps the headline readable over the image.
              Opaque on the left, clear on the right where the globe sits. */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0 -z-10
              bg-gradient-to-r from-ink-950 via-ink-950/85 to-transparent
            "
          />

          {/* Vertical softening so the globe never fights the pills */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/60 to-transparent"
          />

          <div className="relative w-full grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            {/* ---------- LEFT: copy + actions ---------- */}
            <div>
              <h2 className="text-3xl font-semibold leading-[1.12] tracking-[-0.02em] text-fg-invert sm:text-4xl lg:text-5xl">
                Create Without Limits.
                <br />
                Expand Everywhere.
              </h2>

              <p className="mt-5 max-w-[46ch] text-[15px] leading-7 text-fg-invert-muted sm:text-base">
                Join creators and teams using ORYN Engine to clone voices,
                generate speech, and refine audio — all in one place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="inline-flex">
                  <button
                    onClick={() => navigate('/register')}
                    className="
                      group inline-flex min-h-[48px] w-full cursor-pointer items-center
                      justify-center gap-2 rounded-full
                      bg-brand-500 px-7 text-sm font-medium text-white
                      shadow-[0_8px_24px_-6px_rgba(102,154,247,0.55)]
                      transition duration-200
                      hover:bg-brand-600
                      hover:shadow-[0_14px_38px_-6px_rgba(102,154,247,0.75)]
                      focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-brand-500
                    "
                  >
                    Get Started Free
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </button>
                </span>

                <button
                  onClick={() => {
                    document
                      .getElementById('features')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="
                    inline-flex min-h-[48px] cursor-pointer items-center
                    justify-center rounded-full
                    border border-line-invert bg-white/[0.04] px-7
                    text-sm font-medium text-fg-invert
                    transition duration-200
                    hover:bg-white/[0.09]
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-brand-500
                  "
                >
                  Explore Features
                </button>
              </div>
            </div>

            {/* ---------- RIGHT: feature pills ---------- */}
            <div className="flex justify-center lg:justify-end">
              <ul className="grid w-full gap-3 sm:grid-cols-3 lg:w-[248px] lg:shrink-0 lg:grid-cols-1">
                {pills.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="
                      flex items-center gap-3 rounded-2xl
                      border border-white/12 bg-ink-950/80 px-4 py-3
                    "
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
                      <Icon size={17} strokeWidth={1.8} />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-fg-invert">
                        {title}
                      </span>
                      <span className="block truncate text-[11px] text-fg-invert-muted">
                        {text}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
