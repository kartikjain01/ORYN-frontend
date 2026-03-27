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
    <section className="relative mt-16 md:mt-24 overflow-hidden pb-16">
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="flex flex-col items-center text-center cursor-pointer group transition-transform duration-300 hover:scale-105"
            >
              <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                <img
                  src={card.image}
                  alt={card.alt}
                  className="w-full max-w-[380px] h-[260px] sm:h-[300px] md:h-[320px] object-cover"
                />
              </div>

              <h3 className="mt-6 text-white text-xl sm:text-2xl md:text-3xl font-bold group-hover:text-blue-400 transition-colors">
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
