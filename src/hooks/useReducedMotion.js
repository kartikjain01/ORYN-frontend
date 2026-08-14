import { useEffect, useState } from 'react';

/* Tracks prefers-reduced-motion and keeps tracking it — the OS setting can be
   toggled while the page is open, and animations that only read it at mount
   ignore the user until a reload. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);

    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export default useReducedMotion;
