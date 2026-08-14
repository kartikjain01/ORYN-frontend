/* Window-level normalised pointer position.
 *
 * The hero canvas is pointer-events:none (it must never intercept clicks meant
 * for the robot or the nav), which also means R3F's own pointer state never
 * updates. Tracking at the window instead keeps the shader ripple following the
 * cursor across the whole hero, including the areas covered by the robot image.
 *
 * Ref-counted: the single listener is added on the first subscriber and removed
 * when the last one unmounts.
 */

/** -1..1 on both axes, origin at viewport centre, y up. */
export const pointer = { x: 0, y: 0 };

let listeners = 0;

function onPointerMove(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
}

export function trackPointer() {
  listeners += 1;

  if (listeners === 1) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  return () => {
    listeners -= 1;

    if (listeners === 0) {
      window.removeEventListener('pointermove', onPointerMove);
    }
  };
}
