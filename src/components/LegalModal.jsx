import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LegalModal({ open, type, onClose }) {
  const [accepted, setAccepted] = useState(false);

  // Reset checkbox whenever modal opens or changes
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
              {type === 'terms' ? 'Terms of Use' : 'Privacy Policy'}
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
            {type === 'terms' ? (
              <>
                <h3 className="mb-4 text-2xl font-bold text-black">
                  Terms of Use
                </h3>

                <p>
                  Welcome to ORYN Engine. By accessing or using our AI Voice
                  Cloning, Text-to-Speech and Voice Editing services, you agree
                  to these Terms of Use.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  1. Acceptance of Terms
                </h4>

                <p>
                  By using ORYN Engine you agree to comply with these Terms and
                  all applicable laws.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  2. User Accounts
                </h4>

                <p>
                  You are responsible for maintaining your account and keeping
                  your login credentials secure.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  3. Voice Cloning
                </h4>

                <p>
                  You may only upload voices that you own or have permission to
                  use.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  4. Prohibited Uses
                </h4>

                <ul className="ml-6 mt-3 list-disc">
                  <li>Fraud</li>
                  <li>Identity theft</li>
                  <li>Deepfake abuse</li>
                  <li>Illegal activities</li>
                </ul>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  5. Termination
                </h4>

                <p>
                  ORYN Engine reserves the right to suspend accounts violating
                  these Terms.
                </p>
              </>
            ) : (
              <>
                <h3 className="mb-4 text-2xl font-bold text-black">
                  Privacy Policy
                </h3>

                <p>
                  Your privacy is important to us. This policy explains how we
                  collect and protect your information.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  Information We Collect
                </h4>

                <ul className="ml-6 mt-3 list-disc">
                  <li>Email address</li>
                  <li>Profile information</li>
                  <li>Uploaded audio files</li>
                  <li>Generated speech</li>
                </ul>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  How We Use Data
                </h4>

                <p>
                  Your information is used only to provide and improve ORYN
                  Engine services.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  Security
                </h4>

                <p>
                  We use industry-standard security measures to protect your
                  data.
                </p>

                <h4 className="mt-8 text-xl font-semibold text-black">
                  Contact
                </h4>

                <p>
                  Contact ORYN Engine support for privacy-related questions.
                </p>
              </>
            )}

            {/* Agreement Checkbox */}
            <div className="mt-12 border-t border-gray-200 pt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-violet-600"
                />

                <span className="text-gray-700">
                  I have read and agree to the{' '}
                  <strong>
                    {type === 'terms' ? 'Terms of Use' : 'Privacy Policy'}
                  </strong>
                  .
                </span>
              </label>
            </div>

            <div className="h-8" />
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-200 bg-white px-8 py-5">
            <button
              disabled={!accepted}
              onClick={onClose}
              className={`rounded-xl px-8 py-3 text-lg font-semibold transition ${
                accepted
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              Accept
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
