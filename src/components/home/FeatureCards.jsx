import { useNavigate } from "react-router-dom";
import TiltCard from "../ui/TiltCard";
import voiceCloneImg from "../../assets/images/voice-clone.png";
import ttsImg from "../../assets/images/text-to-speech.png";
import voiceEditorImg from "../../assets/images/ai-voice-editor.png";
const cards = [
  {
    title: "Voice Clone",
    image: voiceCloneImg,
    alt: "Voice Clone",
    path: "/voice-clone",
  },
  {
    title: "Text to Speech",
    image: ttsImg,
    alt: "Text to Speech",
    path: "/text-to-speech",
  },
  {
    title: "AI Voice Editor", // Corrected spelling from "Editer"
    image: voiceEditorImg,
    alt: "AI Voice Editor",
    path: "/voice-editor",
  },
];

export default function FeatureCards() {
  const navigate = useNavigate();

  return (
    <section
      id="features"
      className="relative overflow-visible px-4 sm:px-8 lg:px-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-fg">
            Featured Products
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg text-fg-muted">
            Create, clone, edit and enhance voices using our next-generation
            AI-powered speech technology.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => (
            <TiltCard
              key={card.title}
              as="button"
              type="button"
              onClick={() => navigate(card.path)}
              aria-label={`Open ${card.title}`}
              className="
    group
    flex
    w-full
    cursor-pointer
    flex-col
    items-center
    bg-transparent
    p-0
    text-center

    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-brand-600
    focus-visible:ring-offset-4
    focus-visible:ring-offset-page
    rounded-3xl
  "
            >
              <div
                className="
    relative
    aspect-[1/1]
    w-[85%]
    mx-auto
    overflow-hidden
    rounded-3xl

    border border-line
    bg-card

    shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-8px_rgba(16,24,40,0.10)]

    transition-all
    duration-500

    group-hover:border-brand-100
    group-hover:shadow-[0_2px_4px_rgba(16,24,40,0.05),0_24px_48px_-12px_rgba(102,154,247,0.28)]
  "
              >
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
                />

                {/* Specular highlight tracking the cursor. Position and fade
                    come from the custom properties TiltCard writes. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                  style={{
                    opacity: 'var(--tilt-opacity)',
                    background:
                      'radial-gradient(340px circle at var(--tilt-x) var(--tilt-y), rgba(102,154,247,0.22), transparent 65%)',
                  }}
                />
              </div>

              <h3 className="mt-6 text-fg text-lg sm:text-2xl md:text-3xl font-bold group-hover:text-brand-600 transition-colors">
                {card.title}
              </h3>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
