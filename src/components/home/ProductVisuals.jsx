/* ============================================================
   PRODUCT VISUALS

   Hand-built SVG scenes — one per product — replacing the raster
   mockups. SVG rather than WebGL on purpose: six full-viewport
   slides would mean six live canvases, and browsers cap concurrent
   WebGL contexts (~8-16) before silently dropping the oldest. SVG
   stays crisp at any size, costs nothing when off-screen, and reads
   the blue/black tokens directly so each scene re-tones itself.

   Every scene is deterministic (hash noise, no Math.random) so it
   renders identically on every mount and never shifts during a
   re-render.
   ============================================================ */

const BLUE = '#669af7';
const BLUE_DEEP = '#2563eb';

/* Surface colours per slide tone. */
function palette(tone) {
  const dark = tone === 'dark';

  return {
    dark,
    panel: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    panelSolid: dark ? '#0b1220' : '#ffffff',
    stroke: dark ? 'rgba(255,255,255,0.16)' : '#e3e8f0',
    text: dark ? '#ffffff' : '#0f172a',
    sub: dark ? 'rgba(255,255,255,0.55)' : '#64748b',
    grid: dark ? 'rgba(255,255,255,0.08)' : '#eef2f8',
    mute: dark ? 'rgba(255,255,255,0.28)' : '#cbd5e1',
  };
}

function noise(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* Shared: a row of waveform bars centred on `cy`. */
function Bars({ x, cy, width, count, max, fill, opacity = 1, envelope }) {
  const step = width / count;

  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        const env = envelope ? envelope(t) : 1;
        const h = Math.max(2, env * max * (0.35 + 0.65 * noise(i)));

        return (
          <rect
            key={i}
            x={x + i * step}
            y={cy - h / 2}
            width={Math.max(1.4, step * 0.42)}
            height={h}
            rx={Math.max(0.7, step * 0.21)}
            fill={fill}
          />
        );
      })}
    </g>
  );
}

const bell = t => Math.exp(-Math.pow((t - 0.5) * 3.1, 2));

/* ------------------------------------------------------------
   1 — VOICE CLONE
   A glass sphere holding a neural graph, ringed by a waveform,
   floating above concentric ripples.
   ------------------------------------------------------------ */
const cloneNodes = Array.from({ length: 15 }, (_, i) => {
  const a = i * 2.399963;
  const r = 112 * Math.sqrt((i + 0.6) / 15);
  return { x: 300 + r * Math.cos(a), y: 268 + r * Math.sin(a) };
});

export function VoiceCloneVisual({ tone }) {
  const p = palette(tone);
  const labels = ['Voice Sample', 'AI Analysis', 'Voice Identity'];

  return (
    <svg viewBox="0 0 700 580" className="h-auto w-full" role="img"
      aria-label="A glass sphere containing a glowing neural network, ringed by an audio waveform and labelled Voice Sample, AI Analysis and Voice Identity.">
      <defs>
        <radialGradient id="vc-orb" cx="38%" cy="30%">
          <stop offset="0%" stopColor={BLUE} stopOpacity={p.dark ? 0.42 : 0.3} />
          <stop offset="70%" stopColor={BLUE_DEEP} stopOpacity={p.dark ? 0.2 : 0.12} />
          <stop offset="100%" stopColor={BLUE_DEEP} stopOpacity={0.04} />
        </radialGradient>
        <radialGradient id="vc-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.5" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* waveform behind the sphere */}
      <Bars x={10} cy={268} width={680} count={90} max={150} fill={BLUE}
        opacity={p.dark ? 0.5 : 0.42}
        envelope={t => 0.25 + 0.75 * Math.abs(Math.sin(t * 7)) * (1 - bell(t) * 0.85)} />

      {/* ripple base */}
      {[0, 1, 2, 3].map(i => (
        <ellipse key={i} cx={300} cy={470 + i * 14} rx={120 + i * 55} ry={20 + i * 8}
          fill="none" stroke={BLUE} strokeWidth={1} opacity={0.34 - i * 0.07} />
      ))}
      <ellipse cx={300} cy={470} rx={90} ry={16} fill="url(#vc-glow)" />

      {/* sphere */}
      <circle cx={300} cy={268} r={140} fill="url(#vc-orb)" stroke={BLUE} strokeWidth={1.2} strokeOpacity={0.5} />
      <ellipse cx={258} cy={196} rx={54} ry={30} fill="#fff" opacity={p.dark ? 0.1 : 0.5} transform="rotate(-24 258 196)" />

      {/* neural graph */}
      <g>
        {cloneNodes.map((n, i) =>
          [1, 2, 5].map(step => {
            const m = cloneNodes[(i + step) % cloneNodes.length];
            return (
              <line key={`${i}-${step}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y}
                stroke={BLUE} strokeWidth={0.7} opacity={0.3} />
            );
          })
        )}
        {cloneNodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={7} fill={BLUE} opacity={0.22} />
            <circle cx={n.x} cy={n.y} r={3.1} fill={p.dark ? '#dbeafe' : BLUE_DEEP} />
          </g>
        ))}
      </g>

      {/* floating labels */}
      {labels.map((label, i) => {
        const y = 140 + i * 148;
        return (
          <g key={label}>
            <path d={`M470,${y} C 440,${y} 430,268 452,268`} fill="none"
              stroke={p.mute} strokeWidth={1} strokeDasharray="3 4" />
            <rect x={470} y={y - 21} width={196} height={42} rx={21}
              fill={p.panel} stroke={p.stroke} strokeWidth={1} />
            <circle cx={496} cy={y} r={9} fill={BLUE} opacity={0.16} />
            <circle cx={496} cy={y} r={3.4} fill={BLUE_DEEP} />
            <text x={516} y={y + 5} fill={p.text} fontSize={14} fontWeight={500}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------
   2 — TEXT TO SPEECH
   ------------------------------------------------------------ */
export function TextToSpeechVisual({ tone }) {
  const p = palette(tone);
  const selects = [
    ['Voice', 'Aurora'],
    ['Language', 'English'],
    ['Emotion', 'Confident'],
  ];

  return (
    <svg viewBox="0 0 720 580" className="h-auto w-full" role="img"
      aria-label="A text-to-speech panel with voice, language and emotion selectors above a player showing a generated waveform.">
      {/* radiating arcs */}
      {[0, 1, 2].map(i => (
        <path key={i} d={`M640,${150 + i * 6} A ${140 + i * 34},${140 + i * 34} 0 0 1 640,${430 - i * 6}`}
          fill="none" stroke={BLUE} strokeWidth={1.4} opacity={0.4 - i * 0.11} />
      ))}

      {/* prompt panel */}
      <rect x={40} y={40} width={560} height={190} rx={22}
        fill={p.panel} stroke={p.stroke} strokeWidth={1.2} />
      <text x={72} y={104} fill={p.text} fontSize={22} fontWeight={500}>The future of content creation</text>
      <text x={72} y={140} fill={p.text} fontSize={22} fontWeight={500}>is intelligent, fast and limitless.</text>
      <rect x={493} y={122} width={2.5} height={26} fill={BLUE} />

      {/* selectors */}
      {selects.map(([label, value], i) => {
        const x = 40 + i * 178;
        return (
          <g key={label}>
            <text x={x} y={272} fill={p.sub} fontSize={13}>{label}</text>
            <rect x={x} y={286} width={158} height={50} rx={14}
              fill={p.panel} stroke={p.stroke} strokeWidth={1.1} />
            <circle cx={x + 26} cy={311} r={8} fill={BLUE} opacity={0.18} />
            <circle cx={x + 26} cy={311} r={3} fill={BLUE_DEEP} />
            <text x={x + 44} y={316} fill={p.text} fontSize={14} fontWeight={500}>{value}</text>
            <path d={`M${x + 134},${307} l5,6 l5,-6`} fill="none" stroke={p.sub} strokeWidth={1.6} strokeLinecap="round" />
          </g>
        );
      })}

      {/* generate button */}
      <circle cx={600} cy={311} r={30} fill={BLUE} />
      <Bars x={588} cy={311} width={26} count={5} max={22} fill="#fff" />

      {/* player */}
      <rect x={40} y={380} width={620} height={104} rx={22}
        fill={p.panel} stroke={p.stroke} strokeWidth={1.2} />
      <circle cx={92} cy={432} r={24} fill={BLUE} />
      <path d="M86,423 l16,9 l-16,9 z" fill="#fff" />
      <Bars x={134} cy={432} width={340} count={64} max={54} fill={BLUE}
        envelope={t => 0.3 + 0.7 * Math.abs(Math.sin(t * 9.5))} />
      <text x={498} y={438} fill={p.sub} fontSize={14}>00:00 / 00:08</text>
      <rect x={606} y={410} width={44} height={44} rx={13} fill="none" stroke={p.stroke} strokeWidth={1.2} />
      <path d="M628,421 v16 m-7,-7 l7,7 l7,-7" fill="none" stroke={p.text} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------
   3 — VOICE EDITOR
   Noisy grey terrain resolving into smooth blue waves.
   ------------------------------------------------------------ */
const noisyPath = (() => {
  let d = 'M10,440';
  for (let i = 0; i <= 90; i++) {
    const x = 10 + i * 3.7;
    const spike = noise(i) * noise(i + 40);
    const y = 440 - (18 + spike * 150) * (0.45 + 0.55 * Math.sin(i * 0.31) ** 2);
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return `${d} L343,440 Z`;
})();

const smoothPaths = [0, 1, 2].map(row => {
  const amp = 62 - row * 16;
  const yBase = 400 + row * 26;
  let d = `M370,${yBase}`;
  for (let i = 0; i <= 40; i++) {
    const x = 370 + i * 8.4;
    const y = yBase - amp * Math.exp(-Math.pow((i - 13 - row * 6) / 7, 2))
      - amp * 0.55 * Math.exp(-Math.pow((i - 30 + row * 3) / 6, 2));
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
});

/* Hoisted: defining this inside VoiceEditorVisual would create a new
   component type on every render, remounting its subtree each time. */
function EditorCard({ p, x, y, w, title, sub, children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={92} rx={16}
        fill={p.panel} stroke={p.stroke} strokeWidth={1.2} />
      <text x={x + 20} y={y + 28} fill={p.text} fontSize={14} fontWeight={600}>{title}</text>
      <text x={x + 20} y={y + 48} fill={p.sub} fontSize={12}>{sub}</text>
      {children}
    </g>
  );
}

export function VoiceEditorVisual({ tone }) {
  const p = palette(tone);

  return (
    <svg viewBox="0 0 720 560" className="h-auto w-full" role="img"
      aria-label="A before-and-after audio landscape: jagged grey peaks resolving into smooth glowing blue waves, with an AI enhancement progress card.">
      <defs>
        <linearGradient id="ve-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0" />
          <stop offset="45%" stopColor={BLUE} stopOpacity="0.85" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ground grid */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={10} y1={440 + i * 16} x2={710} y2={440 + i * 16}
          stroke={p.grid} strokeWidth={1} />
      ))}

      <path d={noisyPath} fill={p.mute} opacity={p.dark ? 0.32 : 0.5} />
      <path d={noisyPath} fill="none" stroke={p.sub} strokeWidth={1} opacity={0.6} />

      {smoothPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={BLUE} strokeWidth={2.4 - i * 0.5}
          opacity={0.9 - i * 0.24} strokeLinecap="round" />
      ))}

      <rect x={354} y={150} width={3} height={300} fill="url(#ve-beam)" />

      <EditorCard p={p} x={16} y={196} w={200} title="Before" sub="Noisy audio">
        <Bars x={36} cy={268} width={160} count={40} max={26} fill={p.sub} />
      </EditorCard>

      <EditorCard p={p} x={252} y={44} w={230} title="Enhancing audio…" sub="Removing noise, improving clarity">
        <rect x={272} y={104} width={190} height={5} rx={2.5} fill={p.grid} />
        <rect x={272} y={104} width={137} height={5} rx={2.5} fill={BLUE} />
        <text x={468} y={109} fill={BLUE_DEEP} fontSize={12} fontWeight={600} textAnchor="end">72%</text>
      </EditorCard>

      <EditorCard p={p} x={504} y={178} w={200} title="After" sub="Enhanced audio">
        <Bars x={524} cy={250} width={160} count={40} max={30} fill={BLUE} />
      </EditorCard>
    </svg>
  );
}

/* ------------------------------------------------------------
   4 — CAPTION GENERATOR
   Caption panels arranged around a glowing orb.
   ------------------------------------------------------------ */
export function CaptionGeneratorVisual({ tone }) {
  const p = palette(tone);

  const panels = [
    { x: 30, y: 300, w: 210, h: 108, code: 'ES', lines: ['El futuro del contenido', 'está aquí, y habla', 'para todos.'], skew: 7, scale: 1 },
    { x: 214, y: 128, w: 190, h: 92, code: 'HI', lines: ['कंटेंट का भविष्य', 'यहाँ है।'], skew: 3, scale: 0.9 },
    { x: 452, y: 148, w: 190, h: 92, code: 'AR', lines: ['مستقبل المحتوى هنا،', 'ويتحدث مع الجميع.'], skew: -5, scale: 0.9 },
    { x: 250, y: 366, w: 250, h: 116, code: 'EN', lines: ['The future of content', 'is here, and it speaks', 'to everyone.'], skew: 0, scale: 1 },
  ];

  return (
    <svg viewBox="0 0 720 580" className="h-auto w-full" role="img"
      aria-label="A ring of floating caption panels in English, Spanish, Hindi and Arabic surrounding a glowing audio orb.">
      <defs>
        <radialGradient id="cg-orb" cx="50%" cy="42%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.85" />
          <stop offset="60%" stopColor={BLUE_DEEP} stopOpacity="0.32" />
          <stop offset="100%" stopColor={BLUE_DEEP} stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* stage rings */}
      {[0, 1, 2].map(i => (
        <ellipse key={i} cx={360} cy={300} rx={200 + i * 58} ry={78 + i * 24}
          fill="none" stroke={BLUE} strokeWidth={1.1} opacity={0.34 - i * 0.09} />
      ))}

      {/* orb */}
      <circle cx={360} cy={278} r={74} fill="url(#cg-orb)" stroke={BLUE} strokeWidth={1} strokeOpacity={0.55} />
      <Bars x={316} cy={278} width={88} count={22} max={74} fill={p.dark ? '#dbeafe' : '#fff'}
        envelope={t => 0.35 + 0.65 * bell(t) * 1.4} />

      {panels.map(panel => (
        <g key={panel.code} transform={`translate(${panel.x} ${panel.y}) skewY(${panel.skew})`}>
          <rect width={panel.w} height={panel.h} rx={16}
            fill={p.panel} stroke={p.stroke} strokeWidth={1.2}
            opacity={panel.scale < 1 ? 0.9 : 1} />
          <rect x={16} y={16} width={26} height={26} rx={8} fill={BLUE} />
          <text x={29} y={34} fill="#fff" fontSize={12} fontWeight={700} textAnchor="middle">{panel.code}</text>
          {panel.lines.map((line, i) => (
            <text key={i} x={16} y={68 + i * 21} fill={p.text}
              fontSize={panel.scale < 1 ? 13 : 15} fontWeight={500}>{line}</text>
          ))}
          <Bars x={16} cy={panel.h - 16} width={panel.w - 32} count={26} max={9} fill={BLUE} opacity={0.7} />
        </g>
      ))}

      {/* language chips */}
      {['EN', 'ES', 'HI', 'FR', 'DE', '+100'].map((code, i) => (
        <g key={code}>
          <rect x={70 + i * 96} y={512} width={82} height={40} rx={20}
            fill={p.panel} stroke={p.stroke} strokeWidth={1.1} />
          <circle cx={94 + i * 96} cy={532} r={9} fill={BLUE} opacity={0.2} />
          <text x={112 + i * 96} y={537} fill={p.text} fontSize={13} fontWeight={600}>{code}</text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------
   5 — STORYBOARD
   A prompt streaming light into a six-panel board.
   ------------------------------------------------------------ */
export function StoryboardVisual({ tone }) {
  const p = palette(tone);

  return (
    <svg viewBox="0 0 720 560" className="h-auto w-full" role="img"
      aria-label="A prompt card streaming light into a six-panel cinematic storyboard grid.">
      <defs>
        <linearGradient id="sb-stream" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.05" />
          <stop offset="35%" stopColor={BLUE} stopOpacity="0.9" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* prompt card */}
      <rect x={14} y={170} width={186} height={222} rx={20}
        fill={p.panel} stroke={BLUE} strokeWidth={1.3} strokeOpacity={0.5} />
      <text x={36} y={206} fill={BLUE_DEEP} fontSize={12.5} fontWeight={600}>Describe your story…</text>
      {['A young explorer finds', 'an ancient portal to a', 'futuristic world.'].map((line, i) => (
        <text key={i} x={36} y={236 + i * 20} fill={p.text} fontSize={12.5}>{line}</text>
      ))}
      <rect x={36} y={306} width={142} height={30} rx={10} fill="none" stroke={p.stroke} strokeWidth={1} />
      <text x={50} y={326} fill={p.sub} fontSize={11.5}>Cinematic Style</text>
      <circle cx={107} cy={362} r={22} fill={BLUE} />
      <path d="M107,350 l3.4,7.6 l7.6,3.4 l-7.6,3.4 l-3.4,7.6 l-3.4,-7.6 l-7.6,-3.4 l7.6,-3.4 z" fill="#fff" />

      {/* streams */}
      {Array.from({ length: 13 }, (_, i) => {
        const endY = 96 + i * 30;
        return (
          <path key={i} d={`M200,281 C 244,281 250,${endY} 288,${endY}`}
            fill="none" stroke="url(#sb-stream)" strokeWidth={1.3} opacity={0.75} />
        );
      })}

      {/* board */}
      {Array.from({ length: 6 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 300 + col * 142;
        const y = 92 + row * 194;

        return (
          <g key={i}>
            <rect x={x} y={y} width={128} height={176} rx={12}
              fill={p.dark ? 'rgba(255,255,255,0.04)' : '#f4f7fc'}
              stroke={BLUE} strokeWidth={1.1} strokeOpacity={0.45} />
            <rect x={x + 10} y={y + 26} width={108} height={100} rx={7}
              fill={p.dark ? 'rgba(255,255,255,0.06)' : '#e6edf8'} />
            {/* scene sketch */}
            <circle cx={x + 92} cy={y + 50} r={11} fill={BLUE} opacity={0.35} />
            <path d={`M${x + 12},${y + 118} L${x + 44},${y + 78} L${x + 68},${y + 106} L${x + 92},${y + 84} L${x + 116},${y + 118} Z`}
              fill={BLUE} opacity={0.3} />
            <rect x={x + 56} y={y + 96} width={4} height={22} rx={2} fill={BLUE} opacity={0.8} />
            <text x={x + 12} y={y + 20} fill={BLUE_DEEP} fontSize={12} fontWeight={700}>
              {String(i + 1).padStart(2, '0')}
            </text>
            <rect x={x + 10} y={y + 138} width={98} height={5} rx={2.5} fill={p.mute} opacity={0.7} />
            <rect x={x + 10} y={y + 152} width={72} height={5} rx={2.5} fill={p.mute} opacity={0.45} />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------
   6 — VIDEO EDITOR
   Scene cards above a multi-track timeline.
   ------------------------------------------------------------ */
export function VideoEditorVisual({ tone }) {
  const p = palette(tone);

  return (
    <svg viewBox="0 0 720 580" className="h-auto w-full" role="img"
      aria-label="Floating scene cards above a video timeline with clip, audio waveform, music and title-animation tracks.">
      {/* scene cards */}
      {Array.from({ length: 4 }, (_, i) => {
        const x = 24 + i * 142;
        const lift = i === 1 ? -22 : 0;
        return (
          <g key={i} transform={`translate(${x} ${64 + lift}) rotate(${-3 + i * 1.6} 64 70)`}>
            <rect width={128} height={140} rx={13}
              fill={p.panel} stroke={p.stroke} strokeWidth={1.2} />
            <rect x={8} y={8} width={112} height={94} rx={8}
              fill={p.dark ? 'rgba(255,255,255,0.07)' : '#e6edf8'} />
            <path d={`M8,${76} L40,${44} L62,${66} L86,${40} L120,${78} L120,102 L8,102 Z`}
              fill={BLUE} opacity={0.34} />
            <circle cx={98} cy={30} r={10} fill={BLUE} opacity={0.45} />
            <text x={8} y={124} fill={p.sub} fontSize={10.5} fontWeight={600}>
              SCENE {String(i + 1).padStart(2, '0')}
            </text>
            <circle cx={108} cy={119} r={9} fill={BLUE} />
            <path d="M105,115 l6,4 l-6,4 z" fill="#fff" />
          </g>
        );
      })}

      {/* add scene */}
      <g transform="translate(594 64)">
        <rect width={104} height={140} rx={13} fill="none"
          stroke={p.stroke} strokeWidth={1.4} strokeDasharray="6 5" />
        <circle cx={52} cy={62} r={19} fill={BLUE} opacity={0.14} />
        <path d="M52,52 v20 M42,62 h20" stroke={BLUE_DEEP} strokeWidth={2.2} strokeLinecap="round" />
        <text x={52} y={102} fill={p.sub} fontSize={10.5} fontWeight={600} textAnchor="middle">ADD SCENE</text>
      </g>

      {/* toolbar */}
      <rect x={24} y={240} width={266} height={46} rx={14}
        fill={p.panel} stroke={p.stroke} strokeWidth={1.2} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={44 + i * 40} y={256} width={16} height={14} rx={3.5}
          fill={i === 0 ? BLUE : p.sub} opacity={i === 0 ? 1 : 0.6} />
      ))}

      {/* timeline shell */}
      <rect x={24} y={306} width={674} height={230} rx={18}
        fill={p.panel} stroke={p.stroke} strokeWidth={1.2} />

      {/* ruler */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1={56 + i * 78} y1={324} x2={56 + i * 78} y2={334} stroke={p.mute} strokeWidth={1.2} />
          <text x={56 + i * 78} y={348} fill={p.sub} fontSize={10} textAnchor="middle">
            {`00:${String(i * 5).padStart(2, '0')}`}
          </text>
        </g>
      ))}

      {/* clip track */}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x={44 + i * 128} y={360} width={120} height={54} rx={9}
            fill={p.dark ? 'rgba(255,255,255,0.07)' : '#e6edf8'}
            stroke={p.stroke} strokeWidth={1} />
          <path d={`M${44 + i * 128},${402} L${74 + i * 128},${376} L${96 + i * 128},${392} L${122 + i * 128},${372} L${164 + i * 128},${402} Z`}
            fill={BLUE} opacity={0.32} />
        </g>
      ))}

      {/* audio track */}
      <rect x={44} y={426} width={620} height={44} rx={9} fill={BLUE} opacity={0.09} />
      <Bars x={54} cy={448} width={600} count={116} max={34} fill={BLUE}
        envelope={t => 0.3 + 0.7 * Math.abs(Math.sin(t * 11))} />

      {/* music + title tracks */}
      <rect x={44} y={480} width={310} height={22} rx={7} fill={BLUE} opacity={0.22} />
      <text x={58} y={495} fill={p.text} fontSize={11} fontWeight={500}>Music.mp3</text>
      <rect x={366} y={480} width={230} height={22} rx={7} fill={BLUE_DEEP} opacity={0.28} />
      <text x={380} y={495} fill={p.text} fontSize={11} fontWeight={500}>Title Animation</text>

      {/* playhead */}
      <line x1={446} y1={316} x2={446} y2={524} stroke={BLUE_DEEP} strokeWidth={1.8} />
      <circle cx={446} cy={316} r={5.5} fill={BLUE_DEEP} />
      <rect x={404} y={286} width={84} height={26} rx={9} fill={BLUE_DEEP} />
      <text x={446} y={304} fill="#fff" fontSize={12} fontWeight={600} textAnchor="middle">00:15:24</text>
    </svg>
  );
}
