import {
  Mic2,
  AudioLines,
  Wand2,
  Twitter,
  Facebook,
  Instagram,
} from "lucide-react";
import whyChooseUsImage from "../../assets/images/why-choose-us.png";


const features = [
  {
    icon: Mic2,
    title: "Create Your Digital Voice Twin",
    text:
      "Upload a sample voice and generate speech that sounds just like the original speaker. Perfect for creators, storytellers, and personalized audio experiences.",
  },
  {
    icon: Wand2,
    title: "Convert Text Into Natural AI Speech",
    text:
      "Turn any text into clear, expressive voice audio using advanced AI speech synthesis. Ideal for videos, podcasts, audiobooks, and automation.",
  },
  {
    icon: AudioLines,
    title: "Edit, Refine, and Perfect Your Audio",
    text:
      "Modify tone, pacing, pronunciation, and style with powerful voice editing tools to produce studio-quality results without complex software.",
  },
];

export default function WhyChooseUs({ onTerms, onPrivacy }) {
  return (
    <section
      id="why-choose-us"
      className="relative px-4 sm:px-8 lg:px-14 pt-8 md:pt-12 lg:pt-16 pb-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="h-px w-full bg-violet-400/30" />

        <div className="mt-16 flex items-center justify-center gap-6">
          <div className="h-[2px] w-[80px] bg-gradient-to-r from-transparent to-violet-500 md:w-[120px]" />

          <div className="flex items-center gap-4">
            <span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]" />
            <p className="text-lg font-semibold text-white sm:text-xl md:text-2xl">
              Why Choose Us
            </p>
            <span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]" />
          </div>

          <div className="h-[2px] w-[80px] bg-gradient-to-l from-transparent to-violet-500 md:w-[120px]" />
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Why Creators Choose
            <br />
            Our Platform
          </h2>
        </div>

        <div className="mt-14 sm:mt-16 grid items-center gap-10 lg:gap-15 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="h-[420px] overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] transition-transform duration-300 sm:translate-y-0 lg:translate-y-4">
            <img
              src={whyChooseUsImage}
              alt="Why choose us"
              className="w-full h-full object-cover scale-120 object-[center_20%] transition-transform duration-300"
            />
          </div>

          <div>
            <div className="mt-10 space-y-4">
              {features.map(item => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-b from-white/80 via-violet-300 to-violet-600 shadow-[0_10px_30px_rgba(129,90,255,0.24)] md:h-16 md:w-16">
                      <Icon
                        size={26}
                        className="text-[#2A0B57]"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold leading-tight text-white sm:text-xl lg:text-[22px]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm sm:text-[15px] lg:text-[18px] leading-[1.6] text-white/70 max-w-[560px]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-16 h-px w-full bg-violet-400/30" />

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-8 text-sm text-white/55 sm:text-base">
            <button onClick={onTerms} className="transition hover:text-white">
              Terms of Use
            </button>

            <button onClick={onPrivacy} className="transition hover:text-white">
              Privacy Policy
            </button>
          </div>

          <div className="flex items-center gap-5 text-white/80">
            <a
              href="#"
              className="transition hover:text-white active:scale-95"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
            <a
              href="#"
              className="transition hover:text-white active:scale-95"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="#"
              className="transition hover:text-white active:scale-95"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
