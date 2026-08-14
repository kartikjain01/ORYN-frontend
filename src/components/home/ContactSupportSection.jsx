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
  className="relative scroll-mt-24 px-4 py-14 pb-24 sm:px-6 sm:py-20 lg:px-8"
>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 inline-flex items-center rounded-full border border-brand-100 bg-brand-100/40 px-4 py-1.5 text-xs font-medium text-brand-600">
              Support & Contact
            </p>
  
            <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-4xl">
              Need help? Connect with us.
            </h2>
  
            <p className="mt-4 text-sm leading-7 text-fg-muted sm:text-base">
              Get support for voice cloning, text-to-speech, billing, or platform
              issues. Our team is here to help you quickly and clearly.
            </p>
          </div>
  
          <div className="grid gap-5 lg:grid-cols-[1.05fr_1.25fr] lg:gap-6">
          <div className="space-y-6">
<div className="overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-8px_rgba(16,24,40,0.08)] sm:rounded-[32px] sm:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100/50">
                  <MessageSquare size={22} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-fg">Live Chat</h3>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  Talk directly with our support team for quick help with your
                  account, audio workflow, or technical questions.
                </p>
                <button className="mt-5 rounded-2xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-page">
                  Start Chat
                </button>
              </div>
  
              <div className="overflow-hidden rounded-[28px] border border-line bg-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100/50">
                  <Mail size={22} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-fg">
                  Email Support
                </h3>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  Reach us by email for detailed support requests, feedback, or
                  longer issue reports.
                </p>
                <p className="mt-4 text-sm font-medium text-fg">
                  support@aivoiceplatform.com
                </p>
                <button className="mt-5 w-full rounded-2xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-page sm:w-auto">
                  Send Email
                </button>
              </div>
  
              <div className="rounded-[28px] border border-line bg-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100/50">
                  <BookOpen size={22} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-fg">Help Docs</h3>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  Browse setup guides, generation tips, and troubleshooting docs
                  anytime.
                </p>
                <button className="mt-5 rounded-2xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-page">
                  View Docs
                </button>
              </div>
            </div>
  
            <div className="rounded-3xl sm:rounded-[32px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-8px_rgba(16,24,40,0.08)] sm:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-fg">
                    Contact Us
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-fg-muted">
                    Tell us what you need help with and our team will get back to
                    you as soon as possible.
                  </p>
                </div>
  
                <div className="hidden rounded-2xl border border-line bg-page px-6 py-3 text-xs text-fg-muted sm:block">
                  Avg.reply:24h
                </div>
              </div>
  
              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-fg">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full min-h-[46px] rounded-2xl border border-line bg-page px-4 py-3 sm:px-5 text-sm text-fg outline-none placeholder:text-fg-muted transition-colors focus:border-brand-500"
                    />
                  </div>
  
                  <div>
                    <label className="mb-2 block text-sm font-medium text-fg">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full min-h-[46px] rounded-2xl border border-line bg-page px-4 py-3 sm:px-5 text-sm text-fg outline-none placeholder:text-fg-muted transition-colors focus:border-brand-500"
                    />
                  </div>
                </div>
  
                <div>
                  <label className="mb-2 block text-sm font-medium text-fg">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="What can we help you with?"
                    className="w-full min-h-[46px] rounded-2xl border border-line bg-page px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-muted transition-colors focus:border-brand-500"
                  />
                </div>
  
                <div>
                  <label className="mb-2 block text-sm font-medium text-fg">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe your issue or question..."
                    className="w-full resize-none min-h-[46px] rounded-2xl border border-line bg-page px-4 py-3 sm:px-5 text-sm text-fg outline-none placeholder:text-fg-muted transition-colors focus:border-brand-500"
                  />
                </div>
  
                <div className="rounded-2xl border border-line bg-page px-4 py-3 sm:px-5 text-xs leading-6 text-fg-muted">
                  For voice cloning, generation, or processing issues, include
                  your job ID or project name for faster support.
                </div>
  
                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3 text-xs text-fg-muted">
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
                    className="inline-flex w-full items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-6px_rgba(102,154,247,0.55)] transition hover:bg-brand-600 sm:w-auto"
                  >
                    <Send size={16} />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }