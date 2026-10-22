import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function CookiePolicy() {
  const [consent] = useState(() => localStorage.getItem('cookie-consent'));

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Cookie Policy"
        description="How ORYN Engine uses cookies, local storage, and similar technologies on our platform."
        path="/cookies"
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-slate-900">Cookie Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: October 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
          <p>
            This Cookie Policy explains how ORYN Engine (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) uses cookies and similar technologies when you visit{' '}
            <a href="https://www.orynengine.com" className="text-blue-600 hover:underline">
              www.orynengine.com
            </a>.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. What Are Cookies?</h2>
            <p className="mt-3">
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, and understand how you use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Cookies We Use</h2>

            <h3 className="mt-4 font-medium text-slate-900">Essential Cookies (Required)</h3>
            <p className="mt-2">These cookies are necessary for the platform to function and cannot be disabled.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-2 pr-4 font-medium text-slate-900">Cookie</th>
                    <th className="pb-2 pr-4 font-medium text-slate-900">Purpose</th>
                    <th className="pb-2 font-medium text-slate-900">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">sb-*-auth-token</td>
                    <td className="py-2 pr-4">Supabase authentication session</td>
                    <td className="py-2">Session / 7 days</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                    <td className="py-2 pr-4">OAuth PKCE verification</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-medium text-slate-900">Functional Cookies</h3>
            <p className="mt-2">These cookies remember your preferences and settings for a better experience.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-2 pr-4 font-medium text-slate-900">Cookie</th>
                    <th className="pb-2 pr-4 font-medium text-slate-900">Purpose</th>
                    <th className="pb-2 font-medium text-slate-900">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">theme</td>
                    <td className="py-2 pr-4">Remembers light/dark mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">oauth_redirect</td>
                    <td className="py-2 pr-4">Tracks OAuth login flow</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-medium text-slate-900">Advertising Cookies</h3>
            <p className="mt-2">
              We use Google AdSense to display ads. Google may set cookies to serve ads based on your browsing history. These cookies are managed by Google and subject to their{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-2 pr-4 font-medium text-slate-900">Cookie</th>
                    <th className="pb-2 pr-4 font-medium text-slate-900">Purpose</th>
                    <th className="pb-2 font-medium text-slate-900">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">__gads, __gpi</td>
                    <td className="py-2 pr-4">Ad serving and frequency capping</td>
                    <td className="py-2">Google AdSense</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">NID, IDE</td>
                    <td className="py-2 pr-4">Ad personalization</td>
                    <td className="py-2">Google</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Local Storage</h2>
            <p className="mt-3">
              In addition to cookies, we use browser local storage and session storage for:
            </p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Authentication tokens and refresh tokens</li>
              <li>Scroll position and navigation state</li>
              <li>Temporary form data during active sessions</li>
            </ul>
            <p className="mt-3">
              Local storage data persists until you clear your browser data or log out.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Managing Cookies</h2>
            <p className="mt-3">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>View and delete existing cookies</li>
              <li>Block all or third-party cookies</li>
              <li>Set preferences for specific websites</li>
              <li>Get notified when a cookie is set</li>
            </ul>
            <p className="mt-3">
              Disabling essential cookies will prevent you from logging in and using the platform. Disabling advertising cookies will not affect platform functionality but may result in less relevant ads.
            </p>
            <p className="mt-3">
              To opt out of personalized advertising by Google, visit{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Ad Settings
              </a>.
            </p>

            <div className="mt-6 rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-slate-900">Your Cookie Preferences</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {consent === 'accepted'
                      ? 'You have accepted advertising cookies.'
                      : consent === 'declined'
                        ? 'You have declined advertising cookies.'
                        : 'You have not set your cookie preferences yet.'}
                  </p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('cookie-consent');
                      window.location.reload();
                    }}
                    className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Update Cookie Preferences
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Cookie Policy to reflect changes in the cookies we use or for regulatory reasons. We encourage you to revisit this page periodically for the latest information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Contact Us</h2>
            <p className="mt-3">
              If you have questions about our use of cookies, contact us at{' '}
              <a href="mailto:orynengine@gmail.com" className="text-blue-600 hover:underline">
                orynengine@gmail.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} ORYN Engine. All rights reserved.
        </div>
      </div>
    </div>
  );
}
