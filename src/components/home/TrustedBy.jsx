import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is ORYN Engine?',
    a: 'ORYN Engine is an AI voice studio where you can clone your voice, convert text to speech, edit audio, and generate captions for videos. It runs on our own backend using Whisper ASR and custom TTS models.',
  },
  {
    q: 'How does voice cloning work?',
    a: 'You upload a voice sample, and our AI trains a model on your vocal characteristics. Once trained, you can type any text and it will speak in your cloned voice. The model runs on our AWS server using a custom TTS engine.',
  },
  {
    q: 'How does caption generation work?',
    a: 'Upload a video file (MP4, WebM, MOV) and select a caption style. Our backend uses faster-whisper to transcribe the speech, generates ASS subtitles with your chosen template, and burns them into the video using FFmpeg.',
  },
  {
    q: 'What caption styles are available?',
    a: 'We offer 5 styles: CapCut (clean white text), Hormozi (bold pop text), Minimal (subtle text), Podcast (speaker-focused), and Cinematic Multilayer (layered animated captions).',
  },
  {
    q: 'What languages does transcription support?',
    a: 'Auto-detect, English, Hindi, and Hinglish. The system uses faster-whisper with language detection and can transliterate Hindi script to Roman Hinglish automatically.',
  },
  {
    q: 'What is the Text to Speech feature?',
    a: 'Type or paste text and generate natural-sounding audio in 70+ voices. You can control speed, pitch, and emotion. The output is downloadable as MP3 or WAV for use in videos, podcasts, or any project.',
  },
  {
    q: 'What does the Voice Editor do?',
    a: 'The voice editor lets you remove background noise, enhance clarity, adjust tone and pitch, and fine-tune audio output. It works on any uploaded audio file or on generated TTS output.',
  },
  {
    q: 'Is there a file size or duration limit?',
    a: 'Currently, video uploads for captions are limited by server processing capacity. Short to medium videos (under 10 minutes) work best. Voice cloning requires at least 30 seconds of clean audio.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. ORYN Engine is fully web-based. Just sign up and start using all tools directly in your browser — no downloads, plugins, or desktop apps required.',
  },
  {
    q: 'Can I use my cloned voice for YouTube videos?',
    a: 'Yes. Once your voice is cloned, you can generate speech for YouTube narration, shorts, podcasts, courses, or any content. The output audio is yours to use anywhere.',
  },
  {
    q: 'How accurate is the transcription?',
    a: 'We use faster-whisper (based on OpenAI Whisper) which achieves near-human accuracy for English. Hindi and Hinglish accuracy depends on audio clarity, but our balanced mode handles most real-world recordings well.',
  },
  {
    q: 'Can I export captions separately?',
    a: 'Yes. You can download the captioned video (MP4 with burned-in subtitles) or export just the subtitle file (ASS format) to use in your own video editor like Premiere Pro or DaVinci Resolve.',
  },
  {
    q: 'Is ORYN Engine free to use?',
    a: 'We offer a free plan with basic access to all tools. For higher usage limits, faster processing, and priority support, paid plans are available. Check the Upgrade page for details.',
  },
  {
    q: 'How long does voice cloning take?',
    a: 'The initial voice training takes about 2-5 minutes depending on the length of your audio sample. Once trained, generating new speech with your cloned voice takes just a few seconds.',
  },
];

export default function TrustedBy() {
  const [open, setOpen] = useState(null);

  return (
    <section className="relative px-4 pt-16 pb-8 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-500">
          FAQ
        </p>
        <h2 className="mt-3 text-center text-[28px] font-bold tracking-[-0.02em] text-fg sm:text-[34px]">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-center text-[15px] text-fg-muted">
          Everything you need to know about ORYN Engine.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-30 gap-y-0 lg:grid-cols-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-slate-200/80">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-brand-600"
                >
                  <span className="text-[15px] font-semibold text-fg">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-fg-muted transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-48 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-[14px] leading-[1.7] text-fg-muted">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
