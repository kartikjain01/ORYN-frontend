const featureRows = [
  {
    id: "01 / Feature",
    title: "Voice Cloning",
    description:
      "Clone any voice with just 30 seconds of audio. Our advanced neural network captures unique voice characteristics including pitch, tone, and speaking style.",
    bullets: [
      "High-fidelity voice replication",
      "Emotional expression preservation",
      "Secure and private processing",
    ],
    cardType: "upload",
  },
  {
    id: "02 / Feature",
    title: "Text to Speech",
    description:
      "Transform any text into lifelike speech in milliseconds. Our advanced AI models create natural-sounding voices with perfect intonation and emotion.",
    bullets: [
      "Multiple voice personalities and accents",
      "Real-time generation with low latency",
      "High-quality audio output formats",
    ],
    cardType: "tts",
  },
  {
    id: "03 / Feature",
    title: "Voice Editing",
    description:
      "Professional-grade audio editing tools to clean up your recordings. Remove background noise, trim silence, and enhance audio quality with AI-powered processing.",
    bullets: [
      "AI-powered noise removal",
      "Precision trimming and cutting",
      "Audio enhancement filters",
    ],
    cardType: "uploadEdit",
  },
];

function UploadCard({ title, subtitle }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-violet-400/20 bg-white/[0.04] p-6 shadow-lg backdrop-blur-md">

      <div className="flex h-[160px] items-center justify-center rounded-xl border border-violet-400/30 bg-white/[0.03]">
        <div className="text-center">
          <div className="mb-3 text-4xl text-[#A78BFA]">↥</div>
          <p className="text-lg font-medium text-white/90">
            Click to upload audio file
          </p>
          <p className="mt-1 text-sm text-white/45">MP3, WAV, or M4A</p>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xl sm:text-2xl font-medium text-white">{title}</h4>
        <p className="mt-1 text-sm text-white/35">{subtitle}</p>
      </div>

    </div>
  );
}

function TTSCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-violet-400/20 bg-white/[0.04] p-6 shadow-lg backdrop-blur-md">

      <div className="rounded-xl border border-violet-400/30 bg-white/[0.03] p-5">

        <div className="flex h-[130px] items-start rounded-lg border border-violet-400/25 bg-white/[0.02] px-4 py-3 text-sm text-white/40">
          Type or paste the text you want to convert to speech...
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h4 className="text-xl sm:text-2xl font-medium text-white">
              Voice Generation
            </h4>
            <p className="mt-1 text-sm text-white/35">
              Transform text into lifelike speech instantly
            </p>
          </div>

          <button className="rounded-full border border-violet-400/25 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white shadow-md">
            ✦ Generate
          </button>
        </div>

      </div>

    </div>
  );
}

function FeatureText({ id, title, description, bullets }) {
  return (
    <div className="text-left">

      <p className="text-lg text-white/70">{id}</p>

      <h3 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-4 max-w-xl text-base sm:text-lg text-white/80">
        {description}
      </p>

      <ul className="mt-4 space-y-2 text-sm sm:text-base text-white/90">
        {bullets.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>

    </div>
  );
}

export default function FeaturedProduction() {
  return (
    <section className="relative mt-20 px-6 sm:px-10 lg:px-16">

      <div className="mx-auto max-w-7xl">

        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-white">
            Featured Production
          </h2>

          <p className="mt-3 text-base sm:text-lg text-white/80">
            Explore our latest creations
          </p>
        </div>

        <div className="mt-16 space-y-24">

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FeatureText {...featureRows[0]} />
            <div className="flex justify-center lg:justify-end">
              <UploadCard
                title="Voice Cloning"
                subtitle="Clone any voice with 30 seconds of audio"
              />
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <TTSCard />
            </div>
            <div className="order-1 lg:order-2">
              <FeatureText {...featureRows[1]} />
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FeatureText {...featureRows[2]} />
            <div className="flex justify-center lg:justify-end">
              <UploadCard
                title="Voice Editing"
                subtitle="Professional audio cleanup and enhancement"
              />
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}