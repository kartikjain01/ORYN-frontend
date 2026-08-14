import { motion, useScroll, useSpring } from 'framer-motion';

import { useReducedMotion } from '../../hooks/useReducedMotion';

/* Reading-progress rail across the top of the page.
   On a scroll-snap page the jump between slides is abrupt, so the raw progress
   value is run through a spring — the bar glides to each new position and gives
   the snap a sense of continuity the scroll itself doesn't have. */
export default function ScrollProgress() {
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll();

  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
      className="
        pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left
        bg-[linear-gradient(90deg,#9c34ff_0%,#669af7_50%,#4fffff_100%)]
      "
    />
  );
}
