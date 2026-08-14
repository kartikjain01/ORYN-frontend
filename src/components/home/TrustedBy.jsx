/**
 * TrustedBy — social-proof logo strip.
 *
 * ⚠️ PLACEHOLDER NAMES. These are invented studios, not real partners.
 * Swap `logos` for organisations that have actually agreed to be listed,
 * and prefer their official SVG assets over rendered wordmarks.
 * Listing companies you have no relationship with is a false endorsement.
 */
const logos = [
  'Northwind Studio',
  'Kestrel Media',
  'Lumen Labs',
  'Arcadia FM',
  'Solace Audio',
  'Verge Collective',
];

export default function TrustedBy() {
  return (
    <section className="relative px-4 pt-12 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-[13px] tracking-[0.02em] text-fg-muted">
          Trusted by creators and businesses worldwide
        </p>

        <ul
          className="
            mt-6 grid grid-cols-2 items-center gap-x-6 gap-y-6
            sm:grid-cols-3 lg:grid-cols-6
          "
        >
          {logos.map(name => (
            <li key={name} className="flex justify-center">
              <span
                className="
                  text-center text-[15px] font-semibold tracking-[-0.01em]
                  text-fg-muted/55 transition-colors duration-200
                  hover:text-fg
                "
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
