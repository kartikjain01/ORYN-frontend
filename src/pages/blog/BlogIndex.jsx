import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AdUnit from '../../components/AdUnit';

const POSTS = [
  {
    slug: 'ai-voice-cloning-guide',
    title: 'AI Voice Cloning: The Complete Guide for Creators in 2026',
    excerpt: 'Learn how AI voice cloning works, its creative applications, and how to clone your own voice in minutes with ORYN Engine.',
    date: '2026-10-15',
    readTime: '8 min read',
    category: 'Voice Cloning',
  },
  {
    slug: 'text-to-speech-creators',
    title: 'Text to Speech for Content Creators: Turn Scripts into Voiceovers',
    excerpt: 'Discover how AI-powered text-to-speech is revolutionizing content creation — from YouTube videos to podcasts and audiobooks.',
    date: '2026-10-10',
    readTime: '6 min read',
    category: 'Text to Speech',
  },
  {
    slug: 'ai-captions-video',
    title: 'How to Add AI Captions to Any Video — 7 Styles, Any Language',
    excerpt: 'Boost engagement by 80% with word-level synced captions. Learn how ORYN Engine makes captioning effortless.',
    date: '2026-10-05',
    readTime: '5 min read',
    category: 'Captions',
  },
  {
    slug: 'ai-voice-editor-guide',
    title: 'AI Voice Editor: Polish Your Audio Like a Pro Without the Studio',
    excerpt: 'Learn how to use AI-powered voice editing tools to trim, adjust pitch, speed, and emotion — no DAW experience needed.',
    date: '2026-10-01',
    readTime: '6 min read',
    category: 'Voice Editor',
  },
  {
    slug: 'how-ai-voice-cloning-works',
    title: 'How AI Voice Cloning Actually Works: The Technology Explained',
    excerpt: 'A deep dive into the neural networks, mel spectrograms, and training techniques behind modern AI voice cloning systems.',
    date: '2026-09-25',
    readTime: '7 min read',
    category: 'Technology',
  },
  {
    slug: 'best-free-tts-tools-2026',
    title: 'Best Free Text-to-Speech Tools in 2026: A Comprehensive Comparison',
    excerpt: 'Compare the top free TTS tools available in 2026 — features, voice quality, language support, and which one fits your workflow.',
    date: '2026-09-20',
    readTime: '8 min read',
    category: 'Text to Speech',
  },
  {
    slug: 'ai-audio-enhancement-guide',
    title: 'AI Audio Enhancement: Clean Up Your Audio Without Professional Equipment',
    excerpt: 'Learn how AI-powered audio enhancement removes noise, echo, and silence to give you studio-quality audio from any recording.',
    date: '2026-09-15',
    readTime: '6 min read',
    category: 'Audio Enhancement',
  },
  {
    slug: 'start-podcast-with-ai-tools',
    title: 'How to Start a Podcast Using AI Tools in 2026',
    excerpt: 'A step-by-step guide to launching your podcast with AI-powered voice generation, editing, and captioning tools.',
    date: '2026-09-10',
    readTime: '7 min read',
    category: 'Guides',
  },
  {
    slug: 'voice-cloning-ethics-legal-guide',
    title: 'Voice Cloning Ethics: What Creators Need to Know About Consent and Legality',
    excerpt: 'Understanding the ethical and legal landscape of AI voice cloning — consent requirements, fair use, and responsible creation.',
    date: '2026-09-05',
    readTime: '6 min read',
    category: 'Ethics',
  },
  {
    slug: 'ai-tools-for-youtubers-2026',
    title: 'AI Tools Every YouTuber Needs in 2026: Voice, Captions, and Beyond',
    excerpt: 'The essential AI toolkit for YouTube creators — from voiceovers and captions to thumbnail generation and SEO optimization.',
    date: '2026-08-28',
    readTime: '7 min read',
    category: 'YouTube',
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-page text-fg">
      <SEO
        title="Blog"
        description="Tips, guides, and insights on AI voice cloning, text-to-speech, audio editing, and caption generation for creators."
        path="/blog"
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-brand-600 transition mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-3 text-fg-muted text-[15px] max-w-xl">
          Guides, tips, and insights on AI voice technology for creators and teams.
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {POSTS.map((post, i) => (
            <article key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-line bg-card p-6 sm:p-8 transition hover:border-brand-500/40 hover:shadow-lg"
              >
                <div className="flex items-center gap-3 text-[12px] font-medium text-fg-muted">
                  <span className="rounded-full bg-brand-100 px-3 py-0.5 text-brand-600">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight group-hover:text-brand-600 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                  {post.excerpt}
                </p>
              </Link>

              {i === 0 && (
                <div className="mt-8">
                  <AdUnit format="responsive" />
                </div>
              )}
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
