import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LandingLayout, { ServiceCrossLinks } from './LandingLayout';

const CAPTION_STYLES = [
  { name: 'CapCut', desc: 'Clean white text with a cinematic feel' },
  { name: 'Hormozi', desc: 'Bold pop text with word emphasis' },
  { name: 'Minimal', desc: 'Small, subtle text overlay' },
  { name: 'Podcast', desc: 'Podcast-style animated captions' },
  { name: 'Cinematic', desc: 'Layered cinematic multi-line captions' },
  { name: 'Glass', desc: 'Frosted glass background with word highlight' },
  { name: 'Reveal', desc: 'Outline text that fills letter by letter' },
];

const STEPS = [
  { title: 'Upload Video', desc: 'Upload an MP4, WebM, or MOV file (up to 2 minutes, 200 MB).' },
  { title: 'Choose Style & Settings', desc: 'Pick a caption style, language, colors, font, size, and position.' },
  { title: 'Generate Captions', desc: 'AI transcribes the speech and renders styled captions onto your video.' },
  { title: 'Edit & Export', desc: 'Review the transcript, edit any words, re-render if needed, then export as MP4 or ASS.' },
];

const FEATURES = [
  { title: 'AI-Powered Transcription', desc: 'Automatic speech-to-text transcription with support for English, Hindi, and Hinglish.' },
  { title: '7 Caption Styles', desc: 'From clean minimal text to bold Hormozi-style pop captions and cinematic overlays.' },
  { title: 'Full Color & Font Control', desc: '20 text colors, highlight colors, 8 font options, adjustable size, and three position choices.' },
  { title: 'Transcript Editing', desc: 'Edit individual words in the generated transcript and re-render without re-uploading.' },
  { title: 'MP4 & ASS Export', desc: 'Download the video with burned-in captions or export an ASS subtitle file for external editors.' },
  { title: 'Video Rotation', desc: 'Rotate your video 90/180/270 degrees before generating captions.' },
];

const FAQS = [
  {
    q: 'What video formats are supported?',
    a: 'ORYN Engine accepts MP4, WebM, and MOV files up to 2 minutes long and 200 MB in size.',
  },
  {
    q: 'Is this a subtitle generator or a social media caption writer?',
    a: 'This is a video subtitle and caption generator. It transcribes the speech in your video and burns styled captions directly onto the footage. It is not a tool for writing social media post captions.',
  },
  {
    q: 'Which languages are supported?',
    a: 'The transcription engine supports English, Hindi, and Hinglish. You can also use Auto Detect to let the system identify the language.',
  },
  {
    q: 'Can I edit the captions after they are generated?',
    a: 'Yes. After generation you can edit any word in the transcript and re-render the video with the corrected text.',
  },
  {
    q: 'What export options are available?',
    a: 'You can download the final video as an MP4 with captions burned in, or export an ASS subtitle file to use in other video editors.',
  },
];

export default function CaptionGenerationLanding() {
  return (
    <LandingLayout>
      <Helmet>
        <title>AI Caption Generator for Videos | ORYN Engine</title>
        <meta name="description" content="Add styled captions to your videos with ORYN Engine. Choose from 7 caption styles, customize colors and fonts, and export as MP4 or subtitle files." />
        <link rel="canonical" href="https://www.orynengine.com/caption-generation" />
        <meta property="og:title" content="AI Caption Generator for Videos | ORYN Engine" />
        <meta property="og:description" content="Add styled captions to your videos with ORYN Engine. AI-powered transcription with customizable caption styles." />
        <meta property="og:url" content="https://www.orynengine.com/caption-generation" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Caption Generator for Videos | ORYN Engine" />
        <meta name="twitter:description" content="Add styled captions to your videos with ORYN Engine." />
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            AI Caption Generator for Videos
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Automatically transcribe speech and add styled captions to your videos. Pick from seven visual styles, customize colors and fonts, then export as MP4 or subtitle files.
          </p>
          <Link to="/register" className="inline-block mt-8 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Caption Styles */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">7 Caption Styles</h2>
          <p className="text-center text-slate-500 text-[15px] mb-10 max-w-xl mx-auto">Each style controls text animation, layout, and emphasis so your captions match the tone of your content.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CAPTION_STYLES.map(s => (
              <div key={s.name} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60">
                <h3 className="text-[14px] font-bold text-slate-800">{s.name}</h3>
                <p className="text-[12px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[14px] font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="text-[14px] font-bold text-slate-800">{step.title}</h3>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/60">
                <h3 className="text-[15px] font-bold text-slate-800">{f.title}</h3>
                <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #f5f0ff 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80">
                <h3 className="text-[15px] font-bold text-slate-800">{faq.q}</h3>
                <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Ready to Caption Your Videos?</h2>
          <p className="text-slate-500 mt-3 text-[15px]">Sign up and start adding professional captions to your videos in minutes.</p>
          <Link to="/register" className="inline-block mt-6 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200">
            Get Started Free
          </Link>
        </div>
      </section>

      <ServiceCrossLinks current="/caption-generation" />
    </LandingLayout>
  );
}
