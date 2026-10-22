import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-6 text-center">
      <SEO title="Page Not Found" path="/404" noindex />

      <div className="relative mb-8">
        <span className="text-[120px] sm:text-[160px] font-extrabold leading-none tracking-tight text-brand-100">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-brand-500 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="m8 11h6" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-fg">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-fg-muted">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-[13px] font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-brand-500"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Home
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3 text-[13px] font-semibold uppercase tracking-wider text-fg-muted transition hover:border-brand-500 hover:text-brand-600"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
