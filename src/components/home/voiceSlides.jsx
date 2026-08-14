import React from 'react';
import VoiceCards from './VoiceCards';

// ===============================
// Voice Card Images
// ===============================

import vcDemo from '../../assets/images/voice-cloning-demo/demo.png';
import ttsDemo from '../../assets/images/tts-demo/demo.png';
import editorDemo from '../../assets/images/voice-editor-demo/demo.png';

// ===============================
// Voice Cloning Audio
// ===============================

import vcReal1 from '../../assets/audio/voice-cloning-demo/real1.wav';
import vcAi1 from '../../assets/audio/voice-cloning-demo/ai1.wav';

// ===============================
// Text To Speech Audio
// ===============================

import ttsReal1 from '../../assets/audio/tts-demo/real1.wav';
import ttsAi1 from '../../assets/audio/tts-demo/ai1.wav';

// ===============================
// Voice Editor Audio
// ===============================

import editorReal1 from '../../assets/audio/voice-editor-demo/real1.wav';
import editorAi1 from '../../assets/audio/voice-editor-demo/ai1.wav';

// ======================================================
// Shared Slide Arrays
// ======================================================

const cloningSlides = [
  { realAudio: vcReal1, aiAudio: vcAi1 },
  { realAudio: vcReal1, aiAudio: vcAi1 },
  { realAudio: vcReal1, aiAudio: vcAi1 },
];

const ttsSlides = [
  { realAudio: ttsReal1, aiAudio: ttsAi1 },
  { realAudio: ttsReal1, aiAudio: ttsAi1 },
  { realAudio: ttsReal1, aiAudio: ttsAi1 },
];

const editorSlides = [
  { realAudio: editorReal1, aiAudio: editorAi1 },
  { realAudio: editorReal1, aiAudio: editorAi1 },
  { realAudio: editorReal1, aiAudio: editorAi1 },
];

// ======================================================
// Voice Cloning
// ======================================================

export const voiceCloning = {
  slides: cloningSlides,

  component: (
    <VoiceCards
      image={vcDemo}
      leftBadge="REAL VOICE"
      rightBadge="AI VOICE"
      left={125}
      top={-855}
      scale={0.4}
      cardGap={-137}
    />
  ),
};

// ======================================================
// Text To Speech
// ======================================================

export const textToSpeech = {
  slides: ttsSlides,

  component: (
    <VoiceCards
      image={ttsDemo}
      leftBadge="TEXT INPUT"
      rightBadge="GENERATED VOICE"
      left={60}
      top={-720}
      scale={0.38}
      cardGap={-130}
    />
  ),
};

// ======================================================
// Voice Editor
// ======================================================

export const voiceEditor = {
  slides: editorSlides,

  component: (
    <VoiceCards
      image={editorDemo}
      leftBadge="ORIGINAL"
      rightBadge="ENHANCED VOICE"
      left={125}
      top={-855}
      scale={0.4}
      cardGap={-137}
    />
  ),
};
