import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    } else if (consent === 'accepted') {
      loadAdSense();
      loadGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
    loadAdSense();
    loadGoogleAnalytics();
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
          <Link to="/cookies" className="underline text-brand-500 hover:text-brand-600">
            Learn more
          </Link>
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

const GA_ID = 'G-F1T4532GML';

function loadGoogleAnalytics() {
  if (document.querySelector(`script[src*="${GA_ID}"]`)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  s.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  };
}
