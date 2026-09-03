/* ============================================================
   PRODUCT CATALOGUE — single source of truth

   Lives outside the section component so both the home page
   showcase and the Features console render the same six tools
   from the same copy. Adding a product here adds it to both.
   ============================================================ */

import {
  Mic,
  AudioLines,
  AudioWaveform,
  Heart,
  Zap,
  Globe,
  Waves,
  SlidersVertical,
  SlidersHorizontal,
  Activity,
  MessageSquareText,
  Crosshair,
  Sparkles,
  Film,
  Image as ImageIcon,
  Clapperboard,
  Wand2,
  Music,
  Share2,
} from 'lucide-react';

import {
  VoiceCloneVisual,
  TextToSpeechVisual,
  VoiceEditorVisual,
  CaptionGeneratorVisual,
  StoryboardVisual,
  VideoEditorVisual,
} from '../components/home/ProductVisuals';

/* `to: null` = no route exists for this tool yet, so the CTA sends
   people to sign-up instead of a dead link. Point these at their real
   routes once the pages are built. */
export const products = [
  {
    id: 'voice-clone',
    tone: 'light',
    badge: { icon: Mic, label: 'Voice Clone' },
    title: 'Your Voice.',
    accent: 'Digitally Reimagined.',
    body: 'Clone any voice with unmatched accuracy and natural emotion. Create a digital version that speaks exactly like the original.',
    cta: { label: 'Clone a Voice', to: '/voice-clone' },
    stats: [
      { icon: AudioLines, title: 'High Accuracy', text: '99% voice fidelity' },
      { icon: Heart, title: 'Natural Emotion', text: 'Real tone. Real feel.' },
      { icon: Zap, title: 'Instant Results', text: 'Ready in seconds' },
    ],
    Visual: VoiceCloneVisual,
  },
  {
    id: 'text-to-speech',
    tone: 'dark',
    badge: { icon: AudioLines, label: 'Text to Speech' },
    title: 'Turn Text into',
    accent: 'Stunning Speech.',
    body: 'Generate natural, expressive voices in seconds with our advanced AI engine. Every word, perfectly spoken.',
    cta: { label: 'Generate Speech', to: '/text-to-speech' },
    stats: [
      { icon: AudioLines, title: '100+ Voices', text: 'Realistic & natural' },
      { icon: Globe, title: '70+ Languages', text: 'Speak globally' },
      { icon: Zap, title: 'Ultra Fast', text: 'Results in seconds' },
    ],
    Visual: TextToSpeechVisual,
  },
  {
    id: 'voice-editor',
    tone: 'light',
    badge: { icon: AudioWaveform, label: 'Voice Editor' },
    title: 'Sculpt Every',
    accent: 'Sound to Perfection.',
    body: 'Remove noise. Enhance clarity. Adjust tone, emotion and rhythm with precision AI tools.',
    cta: { label: 'Start Editing', to: '/voice-editor' },
    stats: [
      { icon: Waves, title: 'Noise Removal', text: 'Crystal clear audio' },
      {
        icon: SlidersVertical,
        title: 'Voice Enhancement',
        text: 'Richer, natural tone',
      },
      { icon: Activity, title: 'Fine Tuning', text: 'Total control' },
    ],
    Visual: VoiceEditorVisual,
  },
  {
    id: 'caption-generator',
    tone: 'dark',
    badge: { icon: MessageSquareText, label: 'Caption Generator' },
    title: 'Every Word.',
    accent: 'Perfectly Captured.',
    body: 'AI-powered captions that understand context, emotion and intent. Accurate, fast and effortlessly global.',
    cta: { label: 'Generate Captions', to: '/caption-generation' },
    stats: [
      { icon: Globe, title: '100+ Languages', text: 'Global reach, no limits' },
      { icon: Crosshair, title: 'High Accuracy', text: 'Context-aware precision' },
      { icon: Sparkles, title: 'Auto Formatting', text: 'Clean and readable' },
    ],
    Visual: CaptionGeneratorVisual,
  },
  {
    id: 'storyboard',
    tone: 'light',
    badge: { icon: Film, label: 'Storyboard' },
    title: 'Visualize Ideas.',
    accent: 'Frame by Frame.',
    body: 'Turn your prompts into cinematic storyboards. AI-generated scenes that bring your story to life, before you shoot.',
    cta: { label: 'Generate Storyboard', to: null },
    stats: [
      { icon: Sparkles, title: 'AI Powered', text: 'Smart scene generation' },
      {
        icon: ImageIcon,
        title: 'Multiple Styles',
        text: 'Cinematic, realistic, anime',
      },
      { icon: Zap, title: 'Fast & Intuitive', text: 'Prompt to board in seconds' },
    ],
    Visual: StoryboardVisual,
  },
  {
    id: 'video-editor',
    tone: 'dark',
    badge: { icon: Clapperboard, label: 'Video Editor' },
    title: 'Edit. Refine.',
    accent: 'Make it Cinematic.',
    body: 'AI-powered video editing made for creators. Cut, enhance, color grade and transform your ideas into stunning videos effortlessly.',
    cta: { label: 'Start Editing', to: null },
    stats: [
      { icon: Wand2, title: 'AI Auto Edit', text: 'Smart cuts, scene detection and seamless transitions.' },
      {
        icon: SlidersHorizontal,
        title: 'Enhance',
        text: 'Auto color grading, lighting and stabilization.',
      },
      { icon: Music, title: 'Audio Sync', text: 'Perfectly sync audio, reduce noise and enhance clarity.' },
      { icon: Share2, title: 'Export Anywhere', text: 'High quality exports for every platform and device.' },
    ],
    Visual: VideoEditorVisual,
  },
];
