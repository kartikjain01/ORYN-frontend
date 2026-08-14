import { AudioLines } from 'lucide-react';

/**
 * Text wordmark.
 *
 * Used instead of assets/images/logo.png because that file is a white
 * wordmark baked onto an OPAQUE GREY background — it renders as a grey
 * box on light surfaces. Swap this back to <img> once a transparent
 * (or dark-on-light) logo variant exists.
 *
 * @param {'light'|'dark'} tone - 'dark' = for use ON dark backgrounds.
 */
export default function Wordmark({ tone = 'light', className = '' }) {
  const onDark = tone === 'dark';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
        <AudioLines size={19} strokeWidth={2} />
      </span>

      <span
        className={`text-[17px] font-semibold tracking-[-0.01em] ${
          onDark ? 'text-fg-invert' : 'text-fg'
        }`}
      >
        ORYN
        {/* brand-500 is only ~2.8:1 on white, so the light-surface variant
            steps down to brand-600; on black, brand-500 reads cleanly. */}
        <span className={onDark ? 'text-brand-500' : 'text-brand-600'}>
          {' '}
          Engine
        </span>
      </span>
    </span>
  );
}
