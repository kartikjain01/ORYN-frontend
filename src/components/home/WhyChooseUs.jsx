import { Mic2, AudioLines, Wand2, Twitter, Facebook, Instagram } from "lucide-react";

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
    <section className="relative mt-24 md:mt-32 lg:mt-40 px-6 sm:px-10 lg:px-14 pb-16">
      <div className="mx-auto max-w-7xl">

        {/* top divider */}
        <div className="h-px w-full bg-violet-400/30" />

        {/* small heading */}
        <div className="mt-16 flex items-center justify-center gap-6">
          <div className="h-[2px] w-[80px] md:w-[120px] bg-gradient-to-r from-transparent to-violet-500" />

          <div className="flex items-center gap-4">
            <span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]" />
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
              Why Choose Us
            </p>
            <span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]" />
          </div>

          <div className="h-[2px] w-[80px] md:w-[120px] bg-gradient-to-l from-transparent to-violet-500" />
        </div>

        {/* title */}
        <div className="mt-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold uppercase leading-tight tracking-tight text-white">
            Why Creators Choose Our
            <br />
            AI Voice Platform
          </h2>
        </div>

        {/* content */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">

          {/* left image */}
          <div className="overflow-hidden rounded-[26px]">
            <img
              src="/src/assets/images/why-choose-us.png"
              alt="Why choose us"
              className="h-auto w-full object-cover"
            />
          </div>

          {/* right text */}
          <div>
            <p className="max-w-[700px] text-base sm:text-lg md:text-xl leading-relaxed text-white/88">
              <span className="font-semibold">Our AI voice</span> platform helps you create
              professional audio in seconds. Clone voices, convert text into natural speech,
              and edit voices with powerful AI tools — all in one place.
              <br />
              Create podcasts, videos, narrations, and content faster without expensive
              recording setups.
            </p>

            <div className="mt-10 space-y-8">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-5">

                    <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-b from-white/80 via-violet-300 to-violet-600 shadow-[0_10px_30px_rgba(129,90,255,0.24)]">
                      <Icon size={26} className="text-[#2A0B57]" strokeWidth={2} />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl md:text-2xl font-semibold leading-tight text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm sm:text-base md:text-lg leading-relaxed text-white/70">
                        {item.text}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* footer */}
        <div className="mt-16 h-px w-full bg-violet-400/30" />

        <div className="mt-6 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-8 text-sm sm:text-base text-white/55">
            <a href="#" className="transition hover:text-white">Terms of use</a>
            <a href="#" className="transition hover:text-white">Privacy Policy</a>
          </div>

          <div className="flex items-center gap-5 text-white/80">
            <a href="#" className="transition hover:text-white" aria-label="Twitter">
              <Twitter size={24} />
            </a>
            <a href="#" className="transition hover:text-white" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="#" className="transition hover:text-white" aria-label="Instagram">
              <Instagram size={24} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}