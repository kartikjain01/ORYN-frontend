import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AdUnit from '../../components/AdUnit';

export default function BlogPost({ meta, children }) {
  return (
    <div className="min-h-screen bg-page text-fg">
      <SEO title={meta.title} description={meta.description} path={`/blog/${meta.slug}`} />
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-brand-600 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
          <span className="text-fg-muted/40">/</span>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-brand-600 transition"
          >
            Blog
          </Link>
        </div>

        <article className="mt-8">
          <div className="flex items-center gap-3 text-[12px] font-medium text-fg-muted">
            <span className="rounded-full bg-brand-100 px-3 py-0.5 text-brand-600">
              {meta.category}
            </span>
            <span>{meta.date}</span>
            <span>{meta.readTime}</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {meta.title}
          </h1>

          <div className="mt-10 prose prose-slate max-w-none text-[15px] leading-[1.85] text-fg/85
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-fg
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-fg
            [&_p]:mb-5
            [&_ul]:mb-5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul_li]:mb-2
            [&_ol]:mb-5 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol_li]:mb-2
            [&_strong]:text-fg [&_strong]:font-semibold
            [&_a]:text-brand-600 [&_a]:underline hover:[&_a]:text-brand-500
          ">
            {children}
          </div>

          <div className="mt-10">
            <AdUnit format="responsive" />
          </div>

          <div className="mt-12 rounded-2xl border border-line bg-card p-8 text-center">
            <h3 className="text-xl font-bold">Ready to try it yourself?</h3>
            <p className="mt-2 text-[15px] text-fg-muted">
              Start creating with ORYN Engine — free to get started.
            </p>
            <Link
              to="/register"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-[13px] font-semibold uppercase tracking-wider text-white transition hover:bg-brand-500"
            >
              Get Started Free
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
