import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';

import VoiceField from './VoiceField';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/* Feature-detect rather than sniff. A context that fails to allocate (blocklisted
   driver, too many live contexts, GPU-less VM) must not take the hero down with
   it — the caller renders its normal gradient underneath either way. */
function detectWebGL() {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) return false;

    /* Release immediately; browsers cap simultaneous contexts and the probe
       would otherwise hold one for the life of the page. */
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    return true;
  } catch {
    return false;
  }
}

/** Wait for an idle moment so the WebGL context never competes with first paint. */
function useDeferredMount(enabled) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, [enabled]);

  return ready;
}

export default function HeroCanvas({ className = '' }) {
  const reducedMotion = useReducedMotion();

  const [supported] = useState(detectWebGL);
  const [failed, setFailed] = useState(false);

  /* Small screens run the light grid: fewer points, smaller sprites, and a DPR
     cap that matters far more on a phone than the point count does. */
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 768);

    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Data Saver is an explicit "spend less on this page" signal from the user. */
  const saveData = useMemo(
    () => typeof navigator !== 'undefined' && navigator.connection?.saveData === true,
    [],
  );

  const enabled = supported && !failed && !saveData;
  const ready = useDeferredMount(enabled);

  if (!enabled || !ready) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <Canvas
        /* Clamped DPR — a 3x phone screen renders 9x the fragments for a field
           that is deliberately soft-edged, and gains nothing visible. */
        dpr={[1, compact ? 1.5 : 1.75]}
        /* Low eye height puts the horizon around the upper third, so the field
           reads across the whole band instead of hugging the bottom edge. */
        camera={{ position: [0, 2.1, 9.5], fov: 58, near: 0.1, far: 100 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          /* Additive points over a black band never need a depth buffer or
             a readback surface. */
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false,
        }}
        /* Nothing here is interactive — skip the per-frame raycast entirely. */
        raycaster={{ enabled: false }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            /* Prevent the default so the browser *can* restore it, but drop the
               canvas from the tree: a lost context on a background flourish is
               not worth a restore dance. */
            e.preventDefault();
            setFailed(true);
          });
        }}
      >
        <Suspense fallback={null}>
          <VoiceField density={compact ? 'low' : 'high'} animate={!reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
