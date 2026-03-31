import {
    Mail,
    MessageSquare,
    BookOpen,
    Send,
    Clock3,
    ShieldCheck,
  } from "lucide-react";
  
  export default function ContactSupportSection() {
    return (
<section
  id="contact"
  className="relative scroll-mt-32 px-4 py-20 pb-36 sm:px-6 lg:px-8"
>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md">
              Support & Contact
            </p>
  
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Need help? Connect with us.
            </h2>
  
            <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
              Get support for voice cloning, text-to-speech, billing, or platform
              issues. Our team is here to help you quickly and clearly.
            </p>
          </div>
  
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1.25fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                  <MessageSquare size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Talk directly with our support team for quick help with your
                  account, audio workflow, or technical questions.
                </p>
                <button className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  Start Chat
                </button>
              </div>
  
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                  <Mail size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Email Support
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Reach us by email for detailed support requests, feedback, or
                  longer issue reports.
                </p>
                <p className="mt-4 text-sm font-medium text-white/80">
                  support@aivoiceplatform.com
                </p>
                <button className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  Send Email
                </button>
              </div>
  
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                  <BookOpen size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Help Docs</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Browse setup guides, generation tips, and troubleshooting docs
                  anytime.
                </p>
                <button className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  View Docs
                </button>
              </div>
            </div>
  
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    Contact Us
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Tell us what you need help with and our team will get back to
                    you as soon as possible.
                  </p>
                </div>
  
                <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs text-white/60 sm:block">
                  Avg.reply:24h
                </div>
              </div>
  
              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/75">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
                    />
                  </div>
  
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/75">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
                    />
                  </div>
                </div>
  
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="What can we help you with?"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
                  />
                </div>
  
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe your issue or question..."
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
                  />
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-white/50">
                  For voice cloning, generation, or processing issues, include
                  your job ID or project name for faster support.
                </div>
  
                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3 text-xs text-white/45">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={14} />
                      Reply within 24 hours
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Secure support handling
                    </span>
                  </div>
  
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
                  >
                    <Send size={16} />
                    SendMessage
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }