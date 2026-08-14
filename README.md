# ORYN Engine

An AI voice workspace for creators. Clone a voice from a sample, turn text into
natural speech, and edit the result — in one place, in the browser, with nothing
to install.

This repository is the **frontend**: the public marketing site and the signed-in
app. The generation itself runs on three separate backend services that this app
talks to over HTTP and WebSocket (see [Environment](#environment)).

---

## What it does

### Live today

| Tool | Route | What it does |
|---|---|---|
| **Voice Clone** | `/voice-clone` | Upload or record a voice sample, build a voice model from it, then speak arbitrary text in that voice. Long-running builds report progress over a WebSocket. |
| **Text to Speech** | `/text-to-speech` | Type or paste text, pick a voice, generate audio. |
| **Voice Editor** | `/voice-editor` | Clean up and reshape generated or uploaded audio — noise, clarity, tone, pacing. |

All three require an account. They sit behind `AppLayout`, which wraps them in
the sidebar shell and redirects to `/register` without a session.

### On the marketing site, not built yet

The home page showcases six products. Three of them have no route and their
call-to-action sends people to sign-up instead of a dead link:

- **Caption Generator** — context-aware captions in 100+ languages
- **Storyboard** — prompts into cinematic frame-by-frame boards
- **Video Editor** — AI-assisted cutting, colour, audio sync

They are marked in `src/data/products.js` with `cta.to: null`. Point those at
real routes as the pages land; nothing else needs to change.

---

## The site, page by page

### `/` — Home

A single scrolling page built as a deck of full-viewport slides. Scroll-snap is
set to `proximity`, so each section lands flush when you come to rest near it,
but a deliberate scroll can still cross a seam at its own pace.

1. **Hero** — dark band, WebGL voice field behind the copy, parallax hand-off
   into the light body below.
2. **Product stack** — the six products, one slide each. From `lg` up these are
   a *sticky stack*: each slide pins to the viewport and the next scrolls up
   over it, so they deal like cards rather than scrolling past.
3. **Why Choose Us** — four reasons orbiting a central visual.
4. **Closing slide** — CTA, social proof and footer share one snap point.

Two overlays open from the navbar:

- **Features console** (`About`) — the six tools drawn as a *signal chain*: a
  wire with six taps, a playhead that travels it, and a stage showing whichever
  tool the playhead is on. It plays itself until you touch it, then it's yours.
  Dark surface.
- **Contact console** (`Contact`) — a support form where your message is
  rendered as a waveform, re-derived from the characters as you type, with live
  word / character / spoken-length readouts. Light surface.

### `/register`

Sign-up and sign-in. Redirects to `/` if already authenticated.

### `/forgot-password`, `/reset-password`

Both render `ForgetPassword`. Supabase is configured with `detectSessionInUrl`
and PKCE, so the reset link resolves in-page.

### `/settings`

Profile, avatar upload, account details. Avatars go to the Supabase `avatars`
storage bucket; the previous file is deleted before the new one is written.

### `/terms`, `/privacy`

Also reachable as modals from the footer via `LegalModal`.

Anything unmatched redirects to `/`.

---

## How the home page is built

Most of the interesting work is in three mechanisms. Each has a failure mode
that is not obvious, so they are documented at length in the source.

### The sticky stack

Six slides in one tall container, each `sticky top-0 h-screen`. As a slide is
covered it scales to 0.94, rounds off and dims, with its copy drifting up
faster than the slide itself so the layers separate.

Three constraints hold it together:

- The page shell is `overflow-x-clip`, **not** `overflow-hidden`. `hidden`
  makes the div a scroll container, and sticky resolves against the nearest
  scroll container — every slide would pin to a box that never scrolls.
- The slides can't carry `snap-start`. A pinned element's snap box sits at the
  scrollport start for as long as it is pinned, so the browser keeps re-snapping
  to the slide you're trying to leave. Separate static markers carry the
  alignment instead.
- The depth transforms use the **callback** form of `useTransform`. The array
  form compiles to a native `ScrollTimeline` whose keyframe offsets must land
  inside `[0,1]`; the last slide's window starts at 1 and runs past it.

Scroll position is a step function, so the transforms read a spring-smoothed
copy of it — they trail the scroll slightly and glide into rest. Only the
decoration is smoothed; the pinning stays locked to the scroll.

### The glass navbar

The bar re-tones off whatever is directly behind it, not off page position. An
IntersectionObserver root is shrunk to the ~96px strip the bar occupies and
watches every element declaring `data-nav-tone`. Inside the sticky stack both
the outgoing and incoming slide are in that strip at once, so it takes the last
in document order — which for those positioned siblings is paint order.

The same reading drives the active nav pill. Ratio thresholds are deliberately
unused: a zero-height anchor reports ratio 0 and a multi-viewport wrapper
reports ~0.17, so neither ever crosses a threshold.

### Product visuals

Every product's artwork is a hand-built SVG scene in
`src/components/home/ProductVisuals.jsx` — no raster mockups. Each takes a
`tone` prop and re-colours itself, so the same scene serves the light slide, the
dark slide and the Features console. Randomness is deterministic hash noise, not
`Math.random`, so render stays pure.

---

## Tech stack

- **React 19** + **React Router 7**
- **Vite 8** (rolldown)
- **Tailwind CSS 4** — design tokens in `@theme` in `src/index.css`
- **Framer Motion 12** — scroll-linked transforms, shared-layout pills
- **three.js** + **@react-three/fiber** / **drei** — hero voice field, lazily
  loaded and self-disabling where WebGL, Data Saver or the GPU can't support it
- **Supabase** — auth (PKCE), profiles table, avatar storage
- **lucide-react** — icons

### Design tokens

Colours are semantic, defined once in `src/index.css`:

```
--color-page      #f7f9fc    page background
--color-card      #ffffff    raised surface
--color-ink-950   #000000    dark slides, hero
--color-brand-500 #669af7    brand blue — decorative only
--color-brand-600 #2563eb    brand blue — anything carrying text
--color-fg        #0f172a    body text
--color-fg-muted  #64748b    secondary text
--color-line      #e3e8f0    hairlines
```

The two brand tiers are not interchangeable. `#669af7` is 2.8:1 on white and
fails WCAG AA, so it must not carry small text or white-on-blue labels against
a light surface. `#2563eb` is 5.2:1 and does.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build to dist/
npm run preview  # serve the build
npm run lint
```

> **Note on lint:** `'motion' is defined but never used` is a known false
> positive from the flat-config `no-unused-vars` rule — it doesn't see the
> `motion.*` JSX member expressions. Same for destructured-and-renamed
> identifiers like `Icon`.

---

## Environment

Create `.env.local` in the repo root:

```bash
VITE_API_VOICE_CLONE=https://…       # voice cloning service
VITE_API_VOICE_GENERATION=https://…  # text-to-speech service
VITE_API_VOICE_EDITOR=https://…      # voice editor service
VITE_WS_URL=wss://…                  # clone build progress
VITE_WS_EDITOR=wss://…               # editor progress
```

The Voice Editor degrades gracefully: with `VITE_API_VOICE_EDITOR` unset it
simulates success so the UI is still explorable.

Supabase credentials are currently **hardcoded** in `src/supabaseClient.js`.
The anon key is a publishable key so this is not a credential leak, but it
should move to `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` before deploy so
environments can differ.

---

## Project structure

```
src/
├─ pages/                 route components
│  ├─ HomePage.jsx        the slide deck
│  ├─ VoiceCloningPage.jsx
│  ├─ TextToSpeechPage.jsx
│  ├─ VoiceEditorPage.jsx
│  ├─ SettingsPage.jsx
│  └─ RegisterPage.jsx, Forgetpassword.jsx, TermsOfUse.jsx, PrivacyPolicy.jsx
├─ components/
│  ├─ layout/             Navbar, Footer, Sidebar, AppLayout, ProfilePanel
│  ├─ home/               marketing sections + ProductVisuals
│  ├─ panels/             ConsoleOverlay + Features / Contact consoles
│  ├─ three/              HeroCanvas, VoiceField
│  └─ ui/                 ScrollProgress, TiltCard
├─ data/products.js       product catalogue — one source for site + console
├─ context/               ProfileContext
├─ hooks/                 useMagnetic, useReducedMotion
├─ lib/                   audioAnalyser, pointer
└─ index.css              design tokens, scroll-snap, base layer
```

`src/data/products.js` is the single source of truth for the six products. The
home page showcase and the Features console both render from it, so adding a
product adds it to both.

---

## Accessibility

- Reduced motion is honoured throughout: scroll-snap off, scroll-linked
  transforms disabled, entrance animations zero-duration.
- Both consoles are real modals — focus enters on open, returns to the trigger
  on close, and Tab is trapped inside.
- Closed overlays are `inert`, so their controls aren't reachable by keyboard.
- Interactive targets are ≥44px (Apple HIG / Material 48dp).
- The Features rail is a roving-tabindex list: one tab stop, arrow keys inside.

---

## Known gaps

- **No support endpoint.** The contact form validates, then hands off to
  `mailto:`. One line in `ContactConsole.jsx` to swap for the API call.
- **Placeholder support address** — `support@aivoiceplatform.com`.
- **`TrustedBy.jsx` uses invented company names.** Replace before launch.
- **Why Choose Us** ships a placeholder image in its circular slot, pending the
  final asset.
- **Three product routes don't exist** (caption generator, storyboard, video
  editor) — their CTAs go to `/register`.
- **Orphaned components** still in the tree: `FeatureCards.jsx`,
  `FeaturedProduction.jsx`, `VoiceComparisonSlider.jsx`,
  `ContactSupportSection.jsx`.
- **Theme drift** — `VoiceCards.jsx`, `Loader.jsx` and parts of `SettingsPage`
  still carry the pre-blue violet palette.
