import { useEffect, useRef, useState } from 'react';

const FORMATS = {
  banner: { style: { display: 'block', width: '100%', height: '90px' }, slot: '8861918058' },
  rectangle: { style: { display: 'inline-block', width: '336px', height: '280px' }, slot: '8861918058' },
  responsive: { style: { display: 'block' }, slot: '8861918058', responsive: true },
};

export default function AdUnit({ format = 'responsive', className = '' }) {
  const pushed = useRef(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pushed.current) return;
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;

    if (!document.querySelector('script[src*="adsbygoogle"]')) return;

    setShow(true);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  const config = FORMATS[format] || FORMATS.responsive;

  return (
    <div className={`ad-unit overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={config.style}
        data-ad-client="ca-pub-5987892460338515"
        data-ad-slot={config.slot}
        {...(config.responsive ? { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' } : {})}
      />
    </div>
  );
}
