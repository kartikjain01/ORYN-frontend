import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    } else if (consent === 'accepted') {
      loadAdSense();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
    loadAdSense();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-white/10 bg-ink-900/95 p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6">
        <div className="flex-1 text-[13px] leading-relaxed text-white/70">
          We use cookies and similar technologies to show personalized ads, analyze
          traffic, and improve your experience.{' '}
          <a href="/cookies" className="underline text-brand-500 hover:text-brand-600">
            Learn more
          </a>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleDecline}
            className="rounded-lg border border-white/15 px-5 py-2 text-[13px] font-medium text-white/60 transition hover:border-white/30 hover:text-white/80"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-brand-600 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-brand-500"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function loadAdSense() {
  if (document.querySelector('script[src*="adsbygoogle"]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5987892460338515';
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}
