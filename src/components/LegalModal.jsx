import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

function TermsContent() {
  return (
    <>
      <h3 className="mb-4 text-2xl font-bold text-black">
        Terms of Service
      </h3>
      <p className="text-sm text-gray-500 mb-6">Last updated: August 2026</p>

      <p>
        Welcome to ORYN Engine ("Platform", "Service", "we", "us"). By creating an account or using any part of our platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        1. Overview of Services
      </h4>
      <p>
        ORYN Engine provides AI-powered voice technology tools including but not limited to:
      </p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Voice Cloning — create a digital replica of a voice from audio samples</li>
        <li>Text to Speech (TTS) — generate natural-sounding speech from text input</li>
        <li>Voice Editor — enhance, denoise, and modify audio files</li>
        <li>Caption Generation — transcribe and burn captions into video files</li>
        <li>Storyboard Generation — AI-generated visual storyboards (coming soon)</li>
        <li>Video Editor — AI-assisted video editing tools (coming soon)</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        2. Account Registration
      </h4>
      <p>
        To use ORYN Engine, you must create an account with a valid email address. You are responsible for:
      </p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Providing accurate and complete registration information</li>
        <li>Maintaining the security of your account credentials</li>
        <li>All activity that occurs under your account</li>
        <li>Notifying us immediately of any unauthorized access</li>
      </ul>
      <p className="mt-3">
        You must be at least 13 years old to create an account. If you are under 18, you must have parental or guardian consent.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        3. Acceptable Use
      </h4>
      <p>You agree to use ORYN Engine only for lawful purposes. You shall NOT:</p>
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

      <h4 className="mt-8 text-xl font-semibold text-black">
        4. Voice Cloning Policy
      </h4>
      <p>
        Voice cloning carries significant ethical responsibility. By using this feature you confirm that:
      </p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>You own the voice being cloned, OR you have written consent from the voice owner</li>
        <li>You will not use cloned voices to impersonate individuals without authorization</li>
        <li>You understand that misuse of voice cloning technology may result in legal consequences</li>
        <li>You accept full responsibility for how you use any cloned voice output</li>
      </ul>
      <p className="mt-3">
        We reserve the right to remove cloned voice models and suspend accounts that violate this policy without prior notice.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        5. Intellectual Property
      </h4>
      <p>
        <strong>Your Content:</strong> You retain ownership of all audio files you upload and content you generate using ORYN Engine. You grant us a limited license to process your content solely to provide the Service.
      </p>
      <p className="mt-3">
        <strong>Our Platform:</strong> All software, AI models, designs, trademarks, and technology powering ORYN Engine remain our exclusive property. You may not copy, modify, or distribute any part of our platform.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        6. Usage Limits & Plans
      </h4>
      <p>
        Free accounts have limited access to processing time, storage, and generation quotas. Paid plans offer higher limits, faster processing, and priority support. We reserve the right to modify plan features and pricing with reasonable notice.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        7. Content Storage & Deletion
      </h4>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Uploaded audio and video files are stored temporarily for processing and may be deleted after 30 days of inactivity</li>
        <li>Cloned voice models remain active as long as your account is in good standing</li>
        <li>You may request deletion of your data at any time through account settings</li>
        <li>Upon account deletion, all associated data will be permanently removed within 30 days</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        8. Service Availability
      </h4>
      <p>
        We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or security patches. We are not liable for any downtime or service interruptions.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        9. Limitation of Liability
      </h4>
      <p>
        ORYN Engine is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, revenue, or profits.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        10. Account Suspension & Termination
      </h4>
      <p>
        We reserve the right to suspend or permanently terminate any account that:
      </p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Violates these Terms of Service</li>
        <li>Engages in abusive or fraudulent activity</li>
        <li>Uses voice cloning without proper consent</li>
        <li>Attempts to harm the platform or other users</li>
      </ul>
      <p className="mt-3">
        You may terminate your account at any time. Upon termination, your right to use the Service ceases immediately.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        11. Changes to Terms
      </h4>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms. We will notify registered users of significant changes via email.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        12. Governing Law
      </h4>
      <p>
        These Terms are governed by applicable laws. Any disputes shall be resolved through good-faith negotiation before pursuing legal remedies.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        13. Contact
      </h4>
      <p>
        For questions about these Terms, contact us at <strong>support@orynengine.com</strong>.
      </p>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h3 className="mb-4 text-2xl font-bold text-black">
        Privacy Policy
      </h3>
      <p className="text-sm text-gray-500 mb-6">Last updated: August 2026</p>

      <p>
        ORYN Engine ("we", "us", "our") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use our platform.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        1. Information We Collect
      </h4>

      <p className="mt-4 font-medium text-black">Account Information:</p>
      <ul className="ml-6 mt-2 list-disc space-y-1">
        <li>Email address</li>
        <li>Full name (if provided)</li>
        <li>Profile picture (if uploaded)</li>
        <li>Authentication provider data (Google, GitHub, LinkedIn)</li>
      </ul>

      <p className="mt-4 font-medium text-black">Content You Upload:</p>
      <ul className="ml-6 mt-2 list-disc space-y-1">
        <li>Audio files for voice cloning and editing</li>
        <li>Video files for caption generation</li>
        <li>Text input for speech generation</li>
      </ul>

      <p className="mt-4 font-medium text-black">Automatically Collected:</p>
      <ul className="ml-6 mt-2 list-disc space-y-1">
        <li>IP address and approximate location</li>
        <li>Browser type and device information</li>
        <li>Usage patterns (pages visited, features used, time spent)</li>
        <li>Error logs and performance data</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        2. How We Use Your Information
      </h4>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>To provide and operate ORYN Engine services</li>
        <li>To process your voice cloning, TTS, and caption requests</li>
        <li>To authenticate your identity and secure your account</li>
        <li>To communicate service updates, changes, and support responses</li>
        <li>To improve our AI models and platform performance</li>
        <li>To detect and prevent abuse, fraud, and security threats</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        3. Voice & Audio Data
      </h4>
      <p>
        We take voice data seriously due to its sensitive nature:
      </p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Voice samples uploaded for cloning are used solely to train your personal voice model</li>
        <li>We do NOT use your voice data to train general-purpose AI models without explicit consent</li>
        <li>Audio files are processed on our secure servers and stored encrypted at rest</li>
        <li>You may delete your voice models and associated audio data at any time</li>
        <li>Generated audio output belongs to you and is not shared with third parties</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        4. Data Sharing
      </h4>
      <p>We do NOT sell your personal information. We may share data only in these cases:</p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li><strong>Service Providers:</strong> Cloud hosting (AWS), authentication (Supabase), and payment processors that help operate our platform</li>
        <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
        <li><strong>Safety:</strong> To protect the rights, safety, or property of ORYN Engine or its users</li>
        <li><strong>Business Transfer:</strong> In case of merger, acquisition, or asset sale (with prior notice)</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        5. Data Security
      </h4>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>All data transmitted over HTTPS/TLS encryption</li>
        <li>Audio and voice data encrypted at rest on our servers</li>
        <li>Access to user data restricted to authorized personnel only</li>
        <li>Regular security audits and vulnerability assessments</li>
        <li>Secure authentication via Supabase with password hashing</li>
      </ul>
      <p className="mt-3">
        While we implement industry-standard security measures, no system is 100% secure. We encourage you to use strong, unique passwords and enable available security features.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        6. Data Retention
      </h4>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Account data is retained as long as your account is active</li>
        <li>Uploaded files may be automatically deleted after 30 days of inactivity</li>
        <li>Voice models persist until you delete them or close your account</li>
        <li>Upon account deletion, all personal data is removed within 30 days</li>
        <li>Anonymized usage statistics may be retained for analytics</li>
      </ul>

      <h4 className="mt-8 text-xl font-semibold text-black">
        7. Your Rights
      </h4>
      <p>You have the right to:</p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
        <li><strong>Correction:</strong> Update or correct inaccurate information</li>
        <li><strong>Deletion:</strong> Request permanent deletion of your account and data</li>
        <li><strong>Export:</strong> Download your generated content and voice models</li>
        <li><strong>Restrict:</strong> Limit how we process your data in certain circumstances</li>
        <li><strong>Withdraw Consent:</strong> Revoke consent for optional data processing at any time</li>
      </ul>
      <p className="mt-3">
        To exercise any of these rights, contact us at <strong>support@orynengine.com</strong> or use the account settings page.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        8. Cookies & Analytics
      </h4>
      <p>
        We use essential cookies for authentication and session management. We may use anonymized analytics to understand usage patterns and improve the platform. We do not use third-party advertising cookies.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        9. Children's Privacy
      </h4>
      <p>
        ORYN Engine is not intended for children under 13. We do not knowingly collect information from children. If we discover that a child under 13 has created an account, we will delete it promptly.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        10. International Users
      </h4>
      <p>
        Our servers are located in India (AWS Mumbai region). By using ORYN Engine, you consent to the transfer and processing of your data in this jurisdiction. We take appropriate measures to protect data regardless of where it is processed.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        11. Changes to This Policy
      </h4>
      <p>
        We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or an in-app notification. Continued use after changes constitutes acceptance.
      </p>

      <h4 className="mt-8 text-xl font-semibold text-black">
        12. Contact Us
      </h4>
      <p>
        For privacy-related questions, data requests, or concerns:
      </p>
      <ul className="ml-6 mt-3 list-disc space-y-1">
        <li>Email: <strong>support@orynengine.com</strong></li>
        <li>Platform: Use the Contact Support panel in the navigation</li>
      </ul>
    </>
  );
}

export default function LegalModal({ open, type, onClose, requireAccept = false }) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (open) {
      setAccepted(false);
    }
  }, [open, type]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-8 py-5">
            <h2 className="text-3xl font-bold text-black">
              {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>

            <button
              onClick={onClose}
              className="rounded-full p-2 transition hover:bg-gray-100"
            >
              <X size={24} className="text-black" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8 text-gray-700 leading-8">
            {type === 'terms' ? <TermsContent /> : <PrivacyContent />}

            {requireAccept && (
              <>
                <div className="mt-12 border-t border-gray-200 pt-6">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={e => setAccepted(e.target.checked)}
                      className="mt-1 h-5 w-5 accent-brand-600"
                    />
                    <span className="text-gray-700">
                      I have read and agree to the{' '}
                      <strong>
                        {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                      </strong>
                      .
                    </span>
                  </label>
                </div>
                <div className="h-8" />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-200 bg-white px-8 py-5">
            {requireAccept ? (
              <button
                disabled={!accepted}
                onClick={onClose}
                className={`rounded-xl px-8 py-3 text-lg font-semibold transition ${
                  accepted
                    ? 'bg-brand-600 text-white hover:bg-brand-500'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                Accept
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-xl px-8 py-3 text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition"
              >
                Close
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
