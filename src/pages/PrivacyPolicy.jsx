import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Privacy Policy"
        description="Learn how ORYN Engine collects, uses, and protects your personal data and voice recordings."
        path="/privacy"
      />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: October 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
          <p>
            ORYN Engine (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy. This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use our platform at{' '}
            <a href="https://www.orynengine.com" className="text-blue-600 hover:underline">
              www.orynengine.com
            </a>.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Information We Collect</h2>

            <h3 className="mt-4 font-medium text-slate-900">Account Information</h3>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Email address</li>
              <li>Full name (if provided)</li>
              <li>Profile picture (if uploaded)</li>
              <li>Authentication provider data (Google, GitHub, LinkedIn)</li>
            </ul>

            <h3 className="mt-4 font-medium text-slate-900">Content You Upload</h3>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Audio files for voice cloning and editing</li>
              <li>Video files for caption generation</li>
              <li>Text input for speech generation</li>
            </ul>

            <h3 className="mt-4 font-medium text-slate-900">Automatically Collected</h3>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>IP address and approximate location</li>
              <li>Browser type and device information</li>
              <li>Usage patterns (pages visited, features used, time spent)</li>
              <li>Error logs and performance data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>To provide and operate ORYN Engine services</li>
              <li>To process your voice cloning, TTS, and caption requests</li>
              <li>To authenticate your identity and secure your account</li>
              <li>To communicate service updates, changes, and support responses</li>
              <li>To improve our AI models and platform performance</li>
              <li>To detect and prevent abuse, fraud, and security threats</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Voice &amp; Audio Data</h2>
            <p className="mt-3">We take voice data seriously due to its sensitive nature:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Voice samples uploaded for cloning are used solely to train your personal voice model</li>
              <li>We do NOT use your voice data to train general-purpose AI models without explicit consent</li>
              <li>Audio files are processed on our secure servers and stored encrypted at rest</li>
              <li>You may delete your voice models and associated audio data at any time</li>
              <li>Generated audio output belongs to you and is not shared with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Data Sharing</h2>
            <p className="mt-3">We do NOT sell your personal information. We may share data only in these cases:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>
                <strong>Service Providers:</strong> Cloud hosting (AWS), authentication (Supabase), and payment processors that help operate our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court order, or government regulation
              </li>
              <li>
                <strong>Safety:</strong> To protect the rights, safety, or property of ORYN Engine or its users
              </li>
              <li>
                <strong>Business Transfer:</strong> In case of merger, acquisition, or asset sale (with prior notice)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Data Security</h2>
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
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Data Retention</h2>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>Account data is retained as long as your account is active</li>
              <li>Uploaded files may be automatically deleted after 30 days of inactivity</li>
              <li>Voice models persist until you delete them or close your account</li>
              <li>Upon account deletion, all personal data is removed within 30 days</li>
              <li>Anonymized usage statistics may be retained for analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Your Rights</h2>
            <p className="mt-3">You have the right to:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request permanent deletion of your account and data</li>
              <li><strong>Export:</strong> Download your generated content and voice models</li>
              <li><strong>Restrict:</strong> Limit how we process your data in certain circumstances</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for optional data processing at any time</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:orynengine@gmail.com" className="text-blue-600 hover:underline">
                orynengine@gmail.com
              </a>{' '}
              or use the account settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Cookies &amp; Analytics</h2>
            <p className="mt-3">
              We use essential cookies for authentication and session management. We may use anonymized analytics to understand usage patterns and improve the platform. We do not use third-party advertising cookies. For more details, see our{' '}
              <Link to="/cookies" className="text-blue-600 hover:underline">
                Cookie Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. Children&rsquo;s Privacy</h2>
            <p className="mt-3">
              ORYN Engine is not intended for children under 18. We do not knowingly collect personal data from minors. If we discover that a person under 18 has created an account without verifiable parental consent, we will delete the account and associated data promptly. If you believe a minor has provided us with personal data, please contact us at{' '}
              <a href="mailto:orynengine@gmail.com" className="text-blue-600 hover:underline">
                orynengine@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">10. International Users</h2>
            <p className="mt-3">
              ORYN Engine uses cloud infrastructure providers located outside India, including Supabase (United States), Vercel (United States), and Hugging Face (United States/European Union) for hosting, authentication, storage, and AI processing. By using our platform, you consent to the transfer and processing of your personal data in these jurisdictions. We ensure that all service providers maintain appropriate security and data protection standards. Your data is protected by encryption in transit (HTTPS/TLS) and at rest regardless of where it is processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">11. Data Breach Notification</h2>
            <p className="mt-3">
              In the event of a data breach that compromises your personal data, we will notify affected users via email within 72 hours of becoming aware of the breach. We will also report the breach to the relevant authorities, including the Data Protection Board of India, as required under the Digital Personal Data Protection Act, 2023. The notification will include the nature of the breach, the data affected, and the steps we are taking to address it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">12. Consent</h2>
            <p className="mt-3">
              By creating an account and using ORYN Engine, you consent to the collection and processing of your personal data as described in this Privacy Policy. Consent is obtained at the time of account registration. You may withdraw your consent at any time by deleting your account through the Settings page or by contacting us at{' '}
              <a href="mailto:orynengine@gmail.com" className="text-blue-600 hover:underline">
                orynengine@gmail.com
              </a>. Withdrawal of consent will result in deletion of your account and all associated personal data within 30 days. Please note that withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">13. Governing Law</h2>
            <p className="mt-3">
              This Privacy Policy is governed by and compliant with the Digital Personal Data Protection Act, 2023 (India) and the Information Technology Act, 2000. Any disputes arising from this policy shall be subject to the jurisdiction of courts in Jaipur, Rajasthan, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">14. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or an in-app notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">15. Contact Us</h2>
            <p className="mt-3">For privacy-related questions, data requests, or concerns:</p>
            <ul className="ml-6 mt-3 list-disc space-y-1">
              <li>
                Email:{' '}
                <a href="mailto:orynengine@gmail.com" className="text-blue-600 hover:underline">
                  orynengine@gmail.com
                </a>
              </li>
              <li>Platform: Use the Contact Support panel in the navigation</li>
            </ul>
          </section>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} ORYN Engine. All rights reserved.
        </div>
      </div>
    </div>
  );
}
