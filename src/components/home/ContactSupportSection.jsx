import { useState } from "react";
import {
  MessageSquare,
  Send,
  Clock3,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Linkedin,
  Instagram,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function ContactSupportSection() {
  const [form, setForm] = useState({ full_name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Please fill in subject and message.');
      return;
    }
    setError('');
    setSending(true);

    const { data: { session } } = await supabase.auth.getSession();

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        full_name: form.full_name.trim() || 'Anonymous',
        email: form.email.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
        user_id: session?.user?.id || null,
      });

    setSending(false);
    if (dbError) {
      setError('Failed to send. Please try again.');
      return;
    }
    setSent(true);
  };

  return (
    <section className="relative px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-500">
            Feedback & Suggestions
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Help us build something better.
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
            Share your ideas, feature requests, or feedback. Every suggestion
            helps us improve ORYN Engine for creators like you.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1.25fr] lg:gap-6">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Follow Us</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Stay updated with new features, tips, and announcements.
              </p>
              <div className="mt-5 flex gap-3">
                <span
                  className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-white/30 cursor-not-allowed"
                  title="Coming soon"
                >
                  <Linkedin size={16} />
                  <span className="text-xs font-medium">LinkedIn</span>
                </span>
                <span
                  className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-white/30 cursor-not-allowed"
                  title="Coming soon"
                >
                  <span className="text-sm font-bold leading-none">𝕏</span>
                  <span className="text-xs font-medium">Twitter</span>
                </span>
                <span
                  className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-white/30 cursor-not-allowed"
                  title="Coming soon"
                >
                  <Instagram size={16} />
                  <span className="text-xs font-medium">Instagram</span>
                </span>
              </div>
              <p className="mt-3 text-[11px] text-white/30">Social links coming soon</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Changelog</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Latest updates and improvements.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/55">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-400">New</span>
                  <div>
                    <span>Caption generation tool</span>
                    <span className="ml-2 text-[10px] text-white/30">Sep 2026</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-400">New</span>
                  <div>
                    <span>Voice editor with noise removal</span>
                    <span className="ml-2 text-[10px] text-white/30">Aug 2026</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-400">Improved</span>
                  <div>
                    <span>Dashboard analytics &amp; notifications</span>
                    <span className="ml-2 text-[10px] text-white/30">Aug 2026</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-400">New</span>
                  <div>
                    <span>Suggestion box &amp; feedback system</span>
                    <span className="ml-2 text-[10px] text-white/30">Sep 2026</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                <MessageSquare size={22} className="text-brand-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Common Questions</h3>
              <div className="mt-4 space-y-2">
                {[
                  { q: 'What audio formats are supported?', a: 'We support MP3 and WAV for uploads. Generated audio is exported as WAV for maximum quality.' },
                  { q: 'How long does voice cloning take?', a: 'Voice cloning typically takes 30–90 seconds depending on the audio length and server load.' },
                  { q: 'Can I use generated audio commercially?', a: 'Yes — audio you generate with your own voice samples is yours to use commercially.' },
                  { q: 'How do I upgrade or change my plan?', a: 'Plans are coming soon. During early access, all features are free and unlimited.' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-2 py-2">
                      <span className="text-sm text-white/55">{item.q}</span>
                      <ChevronDown
                        size={14}
                        className={`shrink-0 text-white/30 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${openFaq === i ? 'max-h-32 pb-2' : 'max-h-0'}`}
                    >
                      <p className="text-[13px] leading-relaxed text-white/35 pl-0">{item.a}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Thanks for the feedback!</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
                  We appreciate your suggestion. It helps us make ORYN Engine better.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ full_name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      Suggestion Box
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      Drop us a suggestion, idea, or anything you'd like to see
                      in ORYN Engine. No reply needed — we read everything.
                    </p>
                  </div>

                  <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs text-white/50 sm:block">
                    Anonymous OK
                  </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full min-h-[46px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 sm:px-5 text-sm text-white outline-none placeholder:text-white/35 transition-colors focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full min-h-[46px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 sm:px-5 text-sm text-white outline-none placeholder:text-white/35 transition-colors focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Feature request, bug, idea..."
                      className="w-full min-h-[46px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 transition-colors focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what you'd like to see..."
                      className="w-full resize-none min-h-[46px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 sm:px-5 text-sm text-white outline-none placeholder:text-white/35 transition-colors focus:border-brand-500"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5 text-xs leading-6 text-white/40">
                    Your name and email are optional — feel free to submit
                    anonymously. We read every suggestion.
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-3 text-xs text-white/40">
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Your data stays private
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={14} />
                        Takes 30 seconds
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex w-full items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-6px_rgba(102,154,247,0.55)] transition hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
                    >
                      {sending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
