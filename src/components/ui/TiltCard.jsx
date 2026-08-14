import { useCallback, useEffect, useRef } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion';

/* Pointer-tracking 3D tilt with a specular highlight that follows the cursor.
 *
 * Two deliberate choices:
 *  - Transforms are written straight to the node inside a rAF, never through
 *    React state. A setState per pointermove would re-render the card ~120x a
 *    second and the tilt would visibly lag the cursor.
 *  - The highlight is driven by CSS custom properties, so the visual treatment
 *    stays in the className the caller passes rather than being hard-coded here.
 *
 * Disabled entirely for coarse pointers (there is no hover to track) and for
 * prefers-reduced-motion, in both cases falling back to a plain wrapper.
 */
export default function TiltCard({
  children,
  className = '',
  max = 9,
  scale = 1.02,
  as: Tag = 'div',
  ...rest
}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const fine = useRef(true);

  useEffect(() => {
    fine.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    cancelAnimationFrame(frame.current);

    /* Long ease on the way out so the card settles instead of snapping flat. */
    el.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = '';
    el.style.setProperty('--tilt-opacity', '0');
  }, []);

  const handleMove = useCallback(
    (e) => {
      if (reduced || !fine.current) return;

      const el = ref.current;
      if (!el) return;

      /* Read geometry now, write in the frame — reading inside the rAF would
         still be correct but forces the layout during the write phase. */
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      cancelAnimationFrame(frame.current);

      frame.current = requestAnimationFrame(() => {
        /* Short ease while tracking: enough to smooth jitter between pointer
           samples, short enough that the card doesn't trail the cursor. The
           long settle-back ease is swapped in by reset(). */
        el.style.transition = 'transform 120ms ease-out';

        /* Tilt toward the cursor: the far edge lifts, the near edge drops. */
        const rotateY = (px - 0.5) * 2 * max;
        const rotateX = -(py - 0.5) * 2 * max;

        el.style.transform =
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) ` +
          `rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`;

        el.style.setProperty('--tilt-x', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--tilt-y', `${(py * 100).toFixed(1)}%`);
        el.style.setProperty('--tilt-opacity', '1');
      });
    },
    [max, scale, reduced],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <Tag
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlur={reset}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        '--tilt-x': '50%',
        '--tilt-y': '50%',
        '--tilt-opacity': '0',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
