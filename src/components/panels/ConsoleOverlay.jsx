import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/* ============================================================
   CONSOLE OVERLAY

   The shared shell for the Features and Contact consoles. Both
   used to be right-hand slide-over drawers full of light cards,
   which read as a different product from the page behind them.
   They are now inset full-bleed instrument surfaces drawn from the
   page's own materials, so opening one feels like the site opening
   up rather than a document sliding in. Features runs dark (it is
   showing artwork); Contact runs light (it is asking you to read
   and type).

   The shell owns the modal mechanics the drawers never had:
   focus entry, focus return, and a tab loop.
   ============================================================ */

/* Two surfaces. The shell is otherwise identical — same geometry, same
   mechanics — so a console only declares which material it is made of. */
const tones = {
  dark: {
    panel: 'border-white/10 bg-ink-950',
    wash: 'bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.28),transparent_46%),radial-gradient(circle_at_92%_8%,rgba(102,154,247,0.12),transparent_34%)]',
    lattice:
      'opacity-[0.55] [background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]',
    headerRule: 'border-white/[0.07]',
    eyebrow: 'text-white/45',
    close:
      'border-white/12 bg-white/[0.06] text-white/70 hover:bg-white/12 hover:text-white',
  },
  light: {
    panel: 'border-line bg-card',
    wash: 'bg-[radial-gradient(circle_at_18%_0%,rgba(102,154,247,0.16),transparent_46%),radial-gradient(circle_at_92%_8%,rgba(37,99,235,0.07),transparent_34%)]',
    lattice:
      'opacity-100 [background-image:linear-gradient(to_right,rgba(16,24,40,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,24,40,0.035)_1px,transparent_1px)]',
    headerRule: 'border-line',
    eyebrow: 'text-fg-muted',
    close:
      'border-line bg-page text-fg-muted hover:bg-white hover:text-fg',
  },
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function ConsoleOverlay({
  open,
  onClose,
  label,
  eyebrow,
  tone = 'dark',
  children,
}) {
  const t = tones[tone];

  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  /* Focus enters the console on open and goes back to whatever opened it on
     close. Without the return trip, closing drops focus to <body> and a
     keyboard user restarts from the top of the document every time. */
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement;
    panelRef.current?.focus();

    return () => {
      const origin = returnFocusRef.current;
      if (origin?.isConnected) origin.focus();
    };
  }, [open]);

  /* Tab loop. `inert` keeps the rest of the app unreachable while a console
     is open, but nothing stops Tab from walking out of the panel into the
     browser chrome and back into the page behind it. */
  const handleKeyDown = event => {
    if (event.key !== 'Tab') return;

    const nodes = Array.from(
      panelRef.current?.querySelectorAll(FOCUSABLE) ?? []
    ).filter(node => node.offsetParent !== null);

    if (!nodes.length) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink-950/70 backdrop-blur-xl"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`absolute inset-2 flex flex-col overflow-hidden rounded-[26px] border shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] outline-none transition-all duration-500 ease-out sm:inset-4 sm:rounded-[32px] ${t.panel} ${
          open ? 'translate-y-0 scale-100' : 'translate-y-5 scale-[0.985]'
        }`}
      >
        {/* Depth wash — same recipe as the hero band, so the console reads as
            the same material as the page rather than as a dialog. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${t.wash}`}
        />

        {/* Console grid — a faint reference lattice, the visual cue that this
            is an instrument surface and not a document. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)] ${t.lattice}`}
        />

        <header
          className={`relative flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-8 sm:py-5 ${t.headerRule}`}
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="relative flex h-2 w-2 shrink-0 rounded-full bg-brand-500"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/70 motion-reduce:animate-none" />
            </span>

            <p
              className={`text-[10.5px] font-semibold uppercase tracking-[0.22em] sm:text-[11px] ${t.eyebrow}`}
            >
              {eyebrow}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${label}`}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${t.close}`}
          >
            <X size={19} strokeWidth={1.9} />
          </button>
        </header>

        <div className="relative flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
