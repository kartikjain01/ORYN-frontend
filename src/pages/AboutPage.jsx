import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Mic2, Waves, SlidersHorizontal, Captions } from 'lucide-react';

const STATS = [
  { value: '4', label: 'AI Tools' },
  { value: '50+', label: 'Voice Models' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<2s', label: 'Generation' },
];

const TOOLS = [
  {
    icon: Mic2,
    name: 'Voice Cloning',
    desc: 'Clone any voice from a short audio sample. Produce realistic replicas for dubbing, narration, or character design — all from your browser.',
  },
  {
    icon: Waves,
    name: 'Text to Speech',
    desc: 'Turn any script into natural, expressive speech. Choose from dozens of voices and fine-tune tone, pace, and emotion to match your content.',
  },
  {
    icon: SlidersHorizontal,
    name: 'Voice Editor',
    desc: 'Fine-tune pitch, speed, emphasis, and pauses. Polish any generated audio until it sounds exactly the way you want — no external software needed.',
  },
  {
    icon: Captions,
    name: 'Caption Generation',
    desc: 'Generate word-level synced captions in 7 styles with Hindi and English support. Burn captions directly onto your videos in seconds.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-page text-fg">
      <SEO
        title="About"
        description="ORYN Engine is a free AI-powered voice platform for creators. Clone voices, generate speech, edit audio, and add captions — all in one place."
        path="/about"
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-brand-600 transition mb-8"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">About ORYN Engine</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fg-muted">
          A free AI-powered voice platform built for the next generation of creators.
        </p>

        {/* MISSION */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Our Mission</h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            ORYN Engine is built for the next generation of creators. We believe every voice
            deserves to be heard — whether you're producing podcasts, building characters for
            games, localizing content across languages, or bringing stories to life. Our
            AI-powered tools give you studio-grade voice production without the studio.
          </p>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            We're committed to making professional audio creation accessible to everyone —
            independent filmmakers, educators, small content teams, and solo creators who
            don't have access to expensive recording setups or voice talent.
          </p>
        </section>

        {/* VISION */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Our Vision</h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            We envision a world where language and budget are never barriers to creating
            great content. A YouTuber in a small town should have the same audio production
            quality as a studio in Mumbai or Los Angeles. A student building their first
            podcast should have access to the same AI tools as a media company.
          </p>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            ORYN Engine is working towards becoming the go-to open audio workspace for
            creators everywhere — expanding to more languages, more voices, real-time
            collaboration, and deeper integrations with the tools creators already use.
            We're building for a future where anyone with a story can tell it in any voice,
            in any language, and reach any audience.
          </p>
        </section>

        {/* STATS */}
        <section className="mt-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-card p-5 text-center">
                <p className="text-2xl font-bold text-brand-600">{s.value}</p>
                <p className="mt-1 text-[12px] uppercase tracking-wider text-fg-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CORE TOOLS */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Core Tools</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="rounded-2xl border border-line bg-card p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100">
                  <tool.icon size={20} className="text-brand-600" />
                </div>
                <h3 className="text-base font-semibold">{tool.name}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            ORYN Engine runs entirely in your browser. There's no software to download, no
            plugins to install, and no complicated setup. Sign up with Google, pick a tool,
            and start creating in under a minute.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-card p-5">
              <p className="text-2xl font-bold text-brand-600">1</p>
              <h3 className="mt-2 text-sm font-semibold">Sign Up Free</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Create your account with Google in one click. No credit card, no trial period — just instant access.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <p className="text-2xl font-bold text-brand-600">2</p>
              <h3 className="mt-2 text-sm font-semibold">Choose Your Tool</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Pick from Voice Cloning, Text to Speech, Voice Editor, or Caption Generation based on what you need.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <p className="text-2xl font-bold text-brand-600">3</p>
              <h3 className="mt-2 text-sm font-semibold">Create & Download</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Generate your audio or captions, preview the result, and download in your preferred format.
              </p>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Our Technology</h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            ORYN Engine is powered by state-of-the-art open-source AI models. We don't build
            black-box proprietary systems — we carefully select, optimize, and deploy the best
            open-source models available, so you get cutting-edge quality without vendor lock-in.
          </p>
          <ul className="mt-5 space-y-3 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              <span><strong className="text-fg font-semibold">Kokoro ONNX</strong> — Our primary text-to-speech engine, delivering natural and expressive speech across 14 English and Hindi voices with low latency.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              <span><strong className="text-fg font-semibold">Coqui XTTS v2</strong> — Powers our voice cloning system. Upload a short audio sample and generate speech in any cloned voice with remarkable accuracy.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              <span><strong className="text-fg font-semibold">Faster-Whisper</strong> — Drives our caption generation with fast, accurate transcription that supports multiple languages and word-level timing.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              <span><strong className="text-fg font-semibold">DeepFilterNet</strong> — Handles audio enhancement, removing background noise, echo, and artifacts to give you clean, studio-quality output.</span>
            </li>
          </ul>
        </section>

        {/* USE CASES */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Who Uses ORYN Engine</h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            Our platform serves a wide range of creators and professionals who need high-quality audio without the complexity or cost of traditional production tools.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-sm font-semibold">YouTube Creators</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Generate consistent voiceovers for videos, add auto-captions for accessibility and engagement, and enhance recorded audio without expensive equipment.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-sm font-semibold">Podcasters</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Clean up interview audio, generate intro and outro narration, and create episode transcripts with accurate timestamps.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-sm font-semibold">Educators & Course Creators</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Produce professional narration for online courses, add multi-language captions to lecture recordings, and maintain a consistent voice across all modules.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-sm font-semibold">Indie Game Developers</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Create character dialogue without hiring voice actors for every line, clone voices for consistency, and generate thousands of variations on a limited budget.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-sm font-semibold">Social Media Managers</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Produce short-form video voiceovers at scale, add trending caption styles to Reels and TikToks, and turn blog posts into audio content.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-sm font-semibold">Accessibility Advocates</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Add captions to any video for hearing-impaired audiences, generate audio versions of written content for visually impaired users, and make content multilingual.
              </p>
            </div>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Who We Are</h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            We're a small team of developers and creators based in Jaipur, India, passionate
            about making AI voice tools accessible to everyone. ORYN Engine started as a side
            project — we wanted a simple, free platform to generate voiceovers and clone voices
            without the price tags and complexity of existing solutions.
          </p>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            Today, ORYN Engine offers four integrated tools — Text to Speech, Voice Cloning,
            Voice Editor, and Caption Generation — all in one workspace. We use open-source AI
            models and deploy on modern cloud infrastructure to keep the platform fast, reliable,
            and completely free for creators.
          </p>
          <p className="mt-4 text-[15px] leading-[1.85] text-fg/85 max-w-2xl">
            We pitched at Rajasthan AI Builders (RAIB) in July 2026 alongside working startups
            and creators, and we're continuously improving the platform based on feedback from our
            growing community of users.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-5 max-w-2xl">
            <div>
              <h3 className="text-[15px] font-semibold">Is ORYN Engine really free?</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-fg-muted">
                Yes. All four tools — Voice Cloning, Text to Speech, Voice Editor, and Caption
                Generation — are completely free to use. We believe creators shouldn't have to
                pay premium prices just to produce quality audio content.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">Do I need to install anything?</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-fg-muted">
                No. ORYN Engine runs entirely in your browser. Just sign up and start creating.
                All AI processing happens on our cloud servers, so it works on any device with
                a modern web browser.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">What languages are supported?</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-fg-muted">
                Our Text to Speech engine supports English and Hindi with 14 voice options. Caption
                generation supports multiple languages including English and Hindi, with automatic
                Hinglish conversion for Indian audiences. Voice cloning works with any language
                present in the source audio.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">How does voice cloning work? Is it safe?</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-fg-muted">
                Voice cloning uses AI to learn the characteristics of a voice from a short audio
                sample (30 seconds to 2 minutes). We take responsible use seriously — our platform
                includes consent verification to prevent misuse. You should only clone voices you
                have explicit permission to use.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">What audio formats can I export?</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-fg-muted">
                You can download generated audio in MP3 and WAV formats. Captioned videos are
                exported as MP4 files with captions burned directly onto the video.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">Can I use ORYN Engine for commercial projects?</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-fg-muted">
                Yes. Audio and captions you generate with ORYN Engine are yours to use in any
                project — YouTube videos, podcasts, online courses, games, social media content,
                and more. There are no licensing restrictions on your output.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-line bg-card p-8 text-center">
          <h3 className="text-xl font-bold">Ready to create?</h3>
          <p className="mt-2 text-[15px] text-fg-muted">
            Start using ORYN Engine for free — no credit card required.
          </p>
          <Link
            to="/register"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-[13px] font-semibold uppercase tracking-wider text-white transition hover:bg-brand-500"
          >
            Get Started Free
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
