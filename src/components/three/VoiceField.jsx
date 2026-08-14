import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { getLevel } from '../../lib/audioAnalyser';
import { pointer, trackPointer } from '../../lib/pointer';

/* A grid of GPU-displaced points read as a "voice landscape": rings travel out
   from the centre at the amplitude of whatever the page is playing, drifting
   noise keeps it from looking like a bare sine, and the pointer pushes a local
   ripple through it.

   All displacement happens in the vertex shader. The CPU only writes three
   uniforms per frame, so point count barely affects frame time — which is why
   this can afford ~14k points. */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uLevel;
  uniform vec2  uPointer;
  uniform float uSize;

  varying float vIntensity;

  /* Value noise — cheap, and at this density indistinguishable from simplex. */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec3 pos = position;
    float dist = length(pos.xz);

    /* Concentric pulse travelling outward — the voice itself. */
    float ring = sin(dist * 1.5 - uTime * 1.7) * 0.5;

    /* Second, slower ring at a different frequency so peaks interfere
       instead of marching in lockstep. */
    ring += sin(dist * 0.6 - uTime * 0.9) * 0.25;

    /* Idle drift: the field still breathes when nothing is playing. */
    float drift = noise(pos.xz * 0.22 + uTime * 0.05) - 0.5;

    /* 0.3 floor keeps a resting motion; audio scales it up hard. */
    float amp = 0.3 + uLevel * 2.4;

    /* Pointer ripple, falling off as a gaussian. */
    float pd = distance(pos.xz, uPointer);
    float ripple = exp(-pd * pd * 0.05) * (0.7 + uLevel * 1.6);

    pos.y += ring * amp + drift * 1.3 + ripple;

    /* Soft circular fade at the rim — no hard edge to the grid. Pushed out far
       enough that the field reaches both screen edges at 16:9. */
    float rim = 1.0 - smoothstep(9.5, 17.0, dist);

    vIntensity = clamp((pos.y + 1.0) * 0.34, 0.0, 1.0) * rim;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    /* Perspective-correct sizing, with crests drawn slightly larger. */
    gl_PointSize = uSize * (1.0 / -mvPosition.z) * (0.55 + vIntensity);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vIntensity;

  void main() {
    /* Round off the point sprite; square particles read as dirt on the lens. */
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;

    float alpha = smoothstep(0.25, 0.0, d2);

    /* Remapped rather than mixed on vIntensity directly: most of the grid sits
       at low intensity, so a linear mix leaves nearly everything on the purple
       stop and the gradient never shows. */
    vec3 color = mix(uColorA, uColorB, smoothstep(0.08, 0.65, vIntensity));

    /* 0.25 floor keeps the troughs legible as a grid; the rest of the range is
       carried by the crests, which additive blending then blooms. */
    gl_FragColor = vec4(color, alpha * (0.25 + vIntensity * 0.75));

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function VoiceField({ density = 'high', animate = true }) {
  const materialRef = useRef(null);
  const pointerTarget = useRef(new THREE.Vector2(0, 0));
  const clock = useRef(0);

  const viewport = useThree((s) => s.viewport);

  useEffect(() => trackPointer(), []);

  /* Grid is rebuilt only when density changes — never per frame. */
  const geometry = useMemo(() => {
    const [cols, rows, span] =
      density === 'low' ? [96, 68, 30] : [156, 112, 34];

    const positions = new Float32Array(cols * rows * 3);
    let i = 0;

    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        positions[i++] = (x / (cols - 1) - 0.5) * span;
        positions[i++] = 0;
        positions[i++] = (z / (rows - 1) - 0.5) * span;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    /* The shader fades the rim itself, so the auto-computed sphere is fine —
       but it must exist or frustum culling pops the whole field out. */
    geo.computeBoundingSphere();

    return geo;
  }, [density]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSize: { value: density === 'low' ? 26 : 34 },
      /* Same two stops as the hero headline gradient. */
      uColorA: { value: new THREE.Color('#9c34ff') },
      uColorB: { value: new THREE.Color('#4fffff') },
    }),
    [density],
  );

  useFrame((_state, delta) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;

    /* Reduced motion freezes the animation but keeps the field rendered —
       a static crest pattern rather than a blank hero. */
    if (animate) {
      /* Clamped so a backgrounded tab doesn't resume with one huge jump. */
      clock.current += Math.min(delta, 1 / 30);
    }

    u.uTime.value = clock.current;
    u.uLevel.value = getLevel();

    /* Window pointer (NDC) → the grid's world scale, eased so the ripple trails
       the cursor instead of snapping to it. */
    pointerTarget.current.set(
      pointer.x * (viewport.width * 0.5),
      -pointer.y * 6,
    );

    u.uPointer.value.lerp(pointerTarget.current, animate ? 0.06 : 1);
  });

  return (
    /* Tilted back so the grid recedes toward the horizon rather than lying flat. */
    <points geometry={geometry} rotation={[-0.16, 0, 0]} position={[0, -1.9, 0]}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        /* Additive so overlapping crests bloom where the wave is loudest. */
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
