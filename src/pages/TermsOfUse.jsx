import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Terms of Service"
        description="Terms and conditions for using ORYN Engine's AI voice cloning, text-to-speech, and audio editing tools."
        path="/terms"
      />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: October 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
          <p>
            Welcome to ORYN Engine (&ldquo;Platform&rdquo;, &ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using any part of our platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Overview of Services</h2>
            <p className="mt-3">ORYN Engine provides AI-powered voice technology tools including but not limited to:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Voice Cloning — create a digital replica of a voice from audio samples</li>
              <li>Text to Speech (TTS) — generate natural-sounding speech from text input</li>
              <li>Voice Editor — enhance, denoise, and modify audio files</li>
              <li>Caption Generation — transcribe and burn captions into video files</li>
              <li>Storyboard Generation — AI-generated visual storyboards (coming soon)</li>
              <li>Video Editor — AI-assisted video editing tools (coming soon)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Account Registration</h2>
            <p className="mt-3">To use ORYN Engine, you must create an account with a valid email address. You are responsible for:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Providing accurate and complete registration information</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-3">
              You must be at least 13 years old to create an account. If you are under 18, you must have parental or guardian consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Acceptable Use</h2>
            <p className="mt-3">You agree to use ORYN Engine only for lawful purposes. You shall NOT:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Clone or replicate any voice without the explicit consent of the voice owner</li>
              <li>Use generated audio for fraud, impersonation, or identity theft</li>
              <li>Create deepfake content intended to deceive, defame, or harm others</li>
              <li>Generate hate speech, harassment, threats, or illegal content</li>
              <li>Use the platform to violate any local, national, or international laws</li>
              <li>Attempt to reverse-engineer, decompile, or extract our AI models</li>
              <li>Circumvent usage limits, rate limits, or access controls</li>
              <li>Resell or redistribute generated content as a competing AI service</li>
              <li>Upload malware, viruses, or any malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Voice Cloning Policy</h2>
            <p className="mt-3">Voice cloning carries significant ethical responsibility. By using this feature you confirm that:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>You own the voice being cloned, OR you have written consent from the voice owner</li>
              <li>You will not use cloned voices to impersonate individuals without authorization</li>
              <li>You understand that misuse of voice cloning technology may result in legal consequences</li>
              <li>You accept full responsibility for how you use any cloned voice output</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove cloned voice models and suspend accounts that violate this policy without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Intellectual Property</h2>
            <p className="mt-3">
              <strong>Your Content:</strong> You retain ownership of all audio files you upload and content you generate using ORYN Engine. You grant us a limited license to process your content solely to provide the Service.
            </p>
            <p className="mt-3">
              <strong>Our Platform:</strong> All software, AI models, designs, trademarks, and technology powering ORYN Engine remain our exclusive property. You may not copy, modify, or distribute any part of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Usage Limits &amp; Plans</h2>
            <p className="mt-3">
              Free accounts have limited access to processing time, storage, and generation quotas. Paid plans offer higher limits, faster processing, and priority support. We reserve the right to modify plan features and pricing with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Content Storage &amp; Deletion</h2>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Uploaded audio and video files are stored temporarily for processing and may be deleted after 30 days of inactivity</li>
              <li>Cloned voice models remain active as long as your account is in good standing</li>
              <li>You may request deletion of your data at any time through account settings</li>
              <li>Upon account deletion, all associated data will be permanently removed within 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Service Availability</h2>
            <p className="mt-3">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or security patches. We are not liable for any downtime or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. Limitation of Liability</h2>
            <p className="mt-3">
              ORYN Engine is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, revenue, or profits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">10. Account Suspension &amp; Termination</h2>
            <p className="mt-3">We reserve the right to suspend or permanently terminate any account that:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Violates these Terms of Service</li>
              <li>Engages in abusive or fraudulent activity</li>
              <li>Uses voice cloning without proper consent</li>
              <li>Attempts to harm the platform or other users</li>
            </ul>
            <p className="mt-3">
              You may terminate your account at any time. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">11. Changes to Terms</h2>
            <p className="mt-3">
              We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms. We will notify registered users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">12. Governing Law</h2>
            <p className="mt-3">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">13. Contact</h2>
            <p className="mt-3">
              For questions about these Terms, contact us at{' '}
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
