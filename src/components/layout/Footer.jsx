import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ArrowRight,
  Check,
} from 'lucide-react';
import Wordmark from './Wordmark';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Voice Clone', to: '/voice-clone' },
      { label: 'Text to Speech', to: '/text-to-speech' },
      { label: 'Voice Editor', to: '/voice-editor' },
      { label: 'Settings', to: '/settings' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', to: '#' },
      { label: 'Guides', to: '#' },
      { label: 'Help Center', to: '#' },
      { label: 'Community', to: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Pricing', to: '#' },
      { label: 'Contact Us', to: '#' },
    ],
  },
];

const socials = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: Instagram, label: 'Instagram' },
];

export default function Footer({ onTerms, onPrivacy }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = e => {
    e.preventDefault();

    if (!email.trim()) return;

    // TODO: wire to your mailing-list provider.
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative mt-12 border-t border-line bg-card px-4 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl py-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,0.8fr)_1.3fr] lg:gap-8">
          {/* ---------- BRAND ---------- */}
          <div>
            <Link to="/" aria-label="ORYN Engine — home">
              <Wordmark />
            </Link>

            <p className="mt-4 max-w-[34ch] text-[13px] leading-6 text-fg-muted">
              An all-in-one platform for voice cloning, speech generation, and
              audio refinement.
            </p>

            <ul className="mt-6 flex items-center gap-2">
              {socials.map(({ Icon, label }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="
                      flex h-11 w-11 items-center justify-center rounded-xl
                      border border-line text-fg-muted
                      transition duration-200
                      hover:border-line hover:bg-page hover:text-fg
                      focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-brand-500
                    "
                  >
                    <Icon size={17} strokeWidth={1.8} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- LINK COLUMNS ---------- */}
          {columns.map(column => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-[13px] font-semibold text-fg">
                {column.heading}
              </h3>

              <ul className="mt-4 space-y-3">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="
                        text-[13px] text-fg-muted transition-colors duration-200
                        hover:text-fg
                        focus-visible:outline-2 focus-visible:outline-offset-2
                        focus-visible:outline-brand-500
                      "
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* ---------- NEWSLETTER ---------- */}
          <div>
            <h3 className="text-[13px] font-semibold text-fg">Newsletter</h3>

            <p className="mt-4 max-w-[32ch] text-[13px] leading-6 text-fg-muted">
              Subscribe for product updates and exclusive offers.
            </p>

            <form onSubmit={handleSubscribe} className="mt-5">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="footer-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setSubscribed(false);
                  }}
                  placeholder="Enter your email"
                  className="
                    min-h-[46px] w-full min-w-0 rounded-xl
                    border border-line bg-card px-4
                    text-[13px] text-fg outline-none
                    placeholder:text-fg-muted
                    transition-colors duration-200
                    focus:border-brand-500
                  "
                />

                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="
                    flex h-[46px] w-[46px] shrink-0 cursor-pointer
                    items-center justify-center rounded-xl
                    bg-brand-500 text-white
                    transition duration-200
                    hover:bg-brand-600
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-brand-500
                  "
                >
                  {subscribed ? <Check size={17} /> : <ArrowRight size={17} />}
                </button>
              </div>

              {/* Announced to screen readers without stealing focus */}
              <p aria-live="polite" className="mt-2 min-h-[18px] text-[12px] text-brand-600">
                {subscribed ? 'Thanks — you’re on the list.' : ''}
              </p>
            </form>
          </div>
        </div>

        {/* ---------- BOTTOM BAR ---------- */}
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-fg-muted">
            © {new Date().getFullYear()} ORYN Engine. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={onPrivacy}
              className="cursor-pointer text-[12px] text-fg-muted transition-colors duration-200 hover:text-fg"
            >
              Privacy Policy
            </button>

            <button
              onClick={onTerms}
              className="cursor-pointer text-[12px] text-fg-muted transition-colors duration-200 hover:text-fg"
            >
              Terms of Service
            </button>

            <button className="cursor-pointer text-[12px] text-fg-muted transition-colors duration-200 hover:text-fg">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
