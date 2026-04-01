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

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="relative px-6 pb-16 pt-28 sm:px-10 md:pt-32 lg:px-14 lg:pt-36"
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
          <h2 className="text-3xl font-semibold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Why Creators Choose Our
            <br />
            AI Voice Platform
          </h2>
        </div>

        <div className="mt-15 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className=" translate-y-18 transition-transform duration-300 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <img
              src={whyChooseUsImage}
              alt="Why choose us"
              className="h-full w-full object-cover translate-y-0 transition-transform duration-300"
            />
          </div>

          <div>
            <p className="max-w-[700px] text-base leading-relaxed text-white/88 sm:text-lg md:text-xl">
              <span className="font-semibold">Our AI voice</span> platform helps
              you create professional audio in seconds. Clone voices, convert
              text into natural speech, and edit voices with powerful AI tools —
              all in one place.
              <br />
              Create podcasts, videos, narrations, and content faster without
              expensive recording setups.
            </p>

            <div className="mt-10 space-y-8">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-b from-white/80 via-violet-300 to-violet-600 shadow-[0_10px_30px_rgba(129,90,255,0.24)] md:h-16 md:w-16">
                      <Icon
                        size={26}
                        className="text-[#2A0B57]"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold leading-tight text-white sm:text-2xl md:text-2xl">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base md:text-lg">
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8 text-sm text-white/55 sm:text-base">
            <a href="#" className="transition hover:text-white">
              Terms of use
            </a>
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
          </div>

          <div className="flex items-center gap-5 text-white/80">
            <a
              href="#"
              className="transition hover:text-white"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
            <a
              href="#"
              className="transition hover:text-white"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="#"
              className="transition hover:text-white"
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