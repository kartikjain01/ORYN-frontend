import { useNavigate } from "react-router-dom";
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
    <section className="relative mt-12 md:mt-24 overflow-visible pb-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="
    group
    flex
    w-full
    cursor-pointer
    flex-col
    items-center
    text-center

    transition-all
    duration-500

    hover:scale-105

    active:scale-[0.98]
  "
            >
              <div
                className="
    aspect-[1/1]
    w-full
    overflow-hidden
    rounded-3xl

    border border-white/10

    shadow-[0_20px_40px_rgba(0,0,0,0.45),
             0_0_30px_rgba(168,85,247,0.25)]

    bg-gradient-to-b
    from-white/5
    to-white/[0.02]

    backdrop-blur-sm

    transition-all
    duration-500


    hover:shadow-[0_35px_70px_rgba(0,0,0,0.6),
                  0_0_50px_rgba(168,85,247,0.45)]
  "
              >
                <img
                  src={card.image}
                  alt={card.alt}
                  className="!w-full !h-full object-cover object-center"
                />
              </div>

              <h3 className="mt-6 text-white text-lg sm:text-2xl md:text-3xl font-bold group-hover:text-blue-400 transition-colors">
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
