import { useCallback, useEffect, useRef } from 'react';

import { useReducedMotion } from './useReducedMotion';

/* Magnetic hover: the element drifts toward the cursor while it is nearby, then
 * springs back. Returns a ref to spread onto any element.
 *
 * Listens on the window rather than the element itself, because the whole point
 * is to react *before* the cursor arrives — element-scoped pointerenter fires
 * too late to read as attraction.
 *
 * @param strength  fraction of the cursor offset the element travels (0..1)
 * @param radius    px beyond the element's bounds where the pull begins
 */
export function useMagnetic({ strength = 0.35, radius = 90 } = {}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const engaged = useRef(false);
  const reduced = useReducedMotion();

  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      /* Skip work entirely for a detached or display:none element. */
      if (rect.width === 0) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      /* Distance to the element's edge, not its centre — otherwise a wide
         button engages far later on its long axis than its short one. */
      const outX = Math.max(0, Math.abs(dx) - rect.width / 2);
      const outY = Math.max(0, Math.abs(dy) - rect.height / 2);
      const dist = Math.hypot(outX, outY);

      if (dist > radius) {
        if (engaged.current) {
          engaged.current = false;

          cancelAnimationFrame(frame.current);
          el.style.transition = 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)';
          el.style.transform = '';
        }
        return;
      }

      engaged.current = true;

      /* Pull eases off toward the edge of the radius so entry isn't a jolt. */
      const falloff = 1 - dist / radius;

      cancelAnimationFrame(frame.current);

      frame.current = requestAnimationFrame(() => {
        el.style.transition = 'transform 150ms ease-out';
        el.style.transform =
          `translate3d(${(dx * strength * falloff).toFixed(1)}px, ` +
          `${(dy * strength * falloff).toFixed(1)}px, 0)`;
      });
    },
    [strength, radius],
  );

  useEffect(() => {
    if (reduced) return;

    /* No cursor to be magnetic toward on a touch device. */
    if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;

    window.addEventListener('pointermove', onMove, { passive: true });

    /* Captured now: by cleanup time React may already have detached the node,
       leaving ref.current null and the transform stranded on a reused element. */
    const node = ref.current;

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame.current);

      if (node) node.style.transform = '';
    };
  }, [onMove, reduced]);

  return ref;
}

export default useMagnetic;
