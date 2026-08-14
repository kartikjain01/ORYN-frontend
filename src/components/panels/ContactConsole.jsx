import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  Clock3,
  Mail,
  RotateCcw,
  Send,
  ShieldCheck,
} from 'lucide-react';

import ConsoleOverlay from './ConsoleOverlay';

/* ============================================================
   CONTACT CONSOLE

   A voice company should not ask you to fill in a grey box. So
   the message you type is rendered as what this product actually
   makes: a waveform. Every keystroke re-derives the bars from the
   characters themselves, and the envelope grows as the message
   does — you can watch a support request become a signal.

   It is decorative, but it is not noise: the shape is a pure
   function of your text, so the same message always draws the
   same wave, and the readouts beside it (words, spoken length)
   are real measurements of what you wrote.
   ============================================================ */

const SUPPORT_EMAIL = 'support@aivoiceplatform.com';

const BAR_COUNT = 104;

/* Message length that fills the whole scope. Roughly the point where a
   support request stops being a one-liner and starts being useful. */
const FULL_SCALE = 260;

/* Average speaking pace, used for the spoken-length readout. */
const WORDS_PER_MINUTE = 150;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Deterministic hash noise, not Math.random: render has to be pure, and the
   same message must always draw the same waveform. */
const noise = (seed, i) =>
  Math.abs(Math.sin(seed * 12.9898 + i * 0.7) * 43758.5453) % 1;

function buildSignal(text) {
  const source = text.trim();
  const fill = Math.min(1, source.length / FULL_SCALE);

  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = i / (BAR_COUNT - 1);

    /* Past the fill point the scope is idle — a flat line, not silence
       drawn as zero, so the instrument still reads as switched on. */
    if (!source.length || t > fill) return 0.04;

    const index = Math.min(
      source.length - 1,
      Math.floor((t / fill) * source.length)
    );

    /* Bell envelope so the wave swells and tapers like an utterance rather
       than sitting at a uniform height. */
    const envelope = 0.55 + 0.45 * Math.sin(Math.PI * (t / fill));

    return Math.max(0.07, noise(source.charCodeAt(index), i) * envelope);
  });
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[12.5px] font-medium text-fg"
        >
          {label}
        </label>

        {hint && (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg-muted">
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-red-600"
        >
          <AlertCircle size={13} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = invalid =>
  `w-full min-h-[48px] rounded-2xl border bg-page px-4 py-3 text-[14px] text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-brand-500 focus:bg-card ${
    invalid ? 'border-red-500/70' : 'border-line'
  }`;

export default function ContactConsole({ open, onClose }) {
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const bars = useMemo(() => buildSignal(form.message), [form.message]);

  const metrics = useMemo(() => {
    const source = form.message.trim();
    const words = source ? source.split(/\s+/).filter(Boolean).length : 0;
    const seconds = Math.round((words / WORDS_PER_MINUTE) * 60);

    return {
      words,
      characters: source.length,
      spoken: `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
        seconds % 60
      ).padStart(2, '0')}`,
    };
  }, [form.message]);

  const update = field => event => {
    const { value } = event.target;
    setForm(current => ({ ...current, [field]: value }));

    /* Clear a field's error as soon as it is being addressed. Holding the
       error until the next submit makes the form feel like it is arguing. */
    setErrors(current =>
      current[field] ? { ...current, [field]: undefined } : current
    );
  };

  const handleSubmit = event => {
    /* The old form had no handler at all, so pressing the button submitted
       to the current URL and reloaded the page, silently discarding
       everything the user had written. */
    event.preventDefault();

    const next = {};

    if (!form.name.trim()) next.name = 'Tell us who you are.';
    if (!EMAIL_PATTERN.test(form.email.trim()))
      next.email = 'That address will not reach you.';
    if (form.message.trim().length < 12)
      next.message = 'A few more words — at least 12 characters.';

    setErrors(next);

    const firstInvalid = Object.keys(next)[0];

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    /* No support endpoint exists yet, so this hands off to the user's mail
       client, which genuinely delivers. Swap this line for the API call
       when there is one — nothing else here needs to change. */
    const body = `${form.message}\n\n— ${form.name} <${form.email}>`;

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      form.subject.trim() || 'Support request'
    )}&body=${encodeURIComponent(body)}`;

    setSent(true);
  };

  const reset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setSent(false);
  };

  return (
    <ConsoleOverlay
      open={open}
      onClose={onClose}
      label="Contact support"
      eyebrow="ORYN — Open channel"
      tone="light"
    >
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* ================= COMPOSER ================= */}
        <div>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[32px]">
            Say something.
            <br />
            <span className="text-brand-600">We are listening.</span>
          </h2>

          <p className="mt-3 max-w-[46ch] text-[13.5px] leading-[1.6] text-fg-muted">
            Voice cloning, generation, billing or something that simply broke —
            it all reaches the same team.
          </p>

          {sent ? (
            <div className="mt-8 rounded-[22px] border border-brand-100 bg-brand-100/35 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
                <Check size={24} strokeWidth={2.4} />
              </span>

              <h3 className="mt-5 text-[20px] font-bold text-fg">
                Handed to your mail client.
              </h3>

              <p className="mt-2 max-w-[44ch] text-[13.5px] leading-[1.6] text-fg-muted">
                Your draft is open and addressed to {SUPPORT_EMAIL}. Send it
                from there and we will reply within 24 hours.
              </p>

              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-card px-5 text-[13.5px] font-medium text-fg transition hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <RotateCcw size={15} strokeWidth={2} />
                Write another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Your name" error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    aria-invalid={errors.name ? 'true' : undefined}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    placeholder="Ada Lovelace"
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field id="email" label="Email address" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    aria-invalid={errors.email ? 'true' : undefined}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    placeholder="you@studio.com"
                    className={inputClass(errors.email)}
                  />
                </Field>
              </div>

              <Field id="subject" label="Subject" hint="optional">
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={update('subject')}
                  placeholder="What is this about?"
                  className={inputClass(false)}
                />
              </Field>

              <Field
                id="message"
                label="Message"
                error={errors.message}
                hint={`${metrics.characters} chars`}
              >
                <textarea
                  id="message"
                  rows={7}
                  value={form.message}
                  onChange={update('message')}
                  aria-invalid={errors.message ? 'true' : undefined}
                  aria-describedby={
                    errors.message ? 'message-error' : 'signal-readout'
                  }
                  placeholder="Describe what happened. Include a job ID or project name if you have one — it roughly halves the round trip."
                  className={`${inputClass(errors.message)} resize-none leading-[1.6]`}
                />
              </Field>

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11.5px] text-fg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} strokeWidth={1.9} />
                    Reply within 24 hours
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={13} strokeWidth={1.9} />
                    Handled privately
                  </span>
                </div>

                <button
                  type="submit"
                  /* brand-600, not brand-500: white on #669af7 is 2.8:1 and
                     fails AA. On a dark slide the button sits on black and
                     reads fine; on this light surface it is the one thing the
                     eye has to land on, so it takes the accessible tier. */
                  className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-brand-600 px-7 text-[14.5px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.45)] transition duration-200 hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <Send
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                  Transmit
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ================= SCOPE ================= */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <div className="overflow-hidden rounded-[22px] border border-line bg-page">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-muted">
                Message signal
              </p>

              <span
                className={`font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  metrics.characters ? 'text-brand-600' : 'text-fg-muted'
                }`}
              >
                {metrics.characters ? 'Live' : 'Idle'}
              </span>
            </div>

            <div className="relative px-5 py-7">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-1/2 h-px bg-line"
              />

              <svg
                viewBox={`0 0 ${BAR_COUNT * 6 - 3} 200`}
                className="h-auto w-full"
                role="img"
                aria-label={
                  metrics.characters
                    ? `Waveform generated from your message, ${metrics.words} words`
                    : 'Waveform scope, idle until you write a message'
                }
              >
                {bars.map((height, i) => {
                  const h = height * 176;

                  return (
                    <rect
                      key={i}
                      x={i * 6}
                      y={100 - h / 2}
                      width={3}
                      height={h}
                      rx={1.5}
                      /* Attributes, with a CSS transition layered on top:
                         geometry properties animate where supported and snap
                         where not, instead of vanishing. */
                      className={
                        reduceMotion
                          ? undefined
                          : 'transition-[height,y] duration-300 ease-out'
                      }
                      /* Deeper blue on the light scope: #669af7 at low
                         opacity all but disappears against white, and the
                         waveform's shape is the whole point of it. */
                      fill={height > 0.05 ? '#2563eb' : 'rgba(16,24,40,0.13)'}
                      opacity={height > 0.05 ? 0.55 + height * 0.45 : 1}
                    />
                  );
                })}
              </svg>
            </div>

            <dl
              id="signal-readout"
              className="grid grid-cols-3 divide-x divide-line border-t border-line"
            >
              {[
                { label: 'Words', value: metrics.words },
                { label: 'Characters', value: metrics.characters },
                { label: 'Spoken', value: metrics.spoken },
              ].map(item => (
                <div key={item.label} className="px-5 py-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 font-mono text-[19px] font-medium tabular-nums text-fg">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-4 text-[12px] leading-[1.6] text-fg-muted">
            The waveform is drawn from your message itself — same words, same
            wave. &ldquo;Spoken&rdquo; estimates how long it would take to read
            aloud at {WORDS_PER_MINUTE} words per minute.
          </p>

          {/* Direct line. The old panel also offered Live Chat and Help Docs
              buttons, but there is no chat backend and no docs route — both
              were dead controls. Email is the one channel that actually
              works, so it is the one that is offered. */}
          <motion.a
            href={`mailto:${SUPPORT_EMAIL}`}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="mt-5 flex items-center gap-4 rounded-[18px] border border-line bg-card px-5 py-4 transition-colors hover:border-brand-500/45 hover:bg-brand-100/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100/50 text-brand-600">
              <Mail size={19} strokeWidth={1.9} />
            </span>

            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-fg">
                Prefer your own inbox?
              </span>
              <span className="block truncate text-[12.5px] text-fg-muted">
                {SUPPORT_EMAIL}
              </span>
            </span>
          </motion.a>
        </div>
      </div>
    </ConsoleOverlay>
  );
}
