# Next Archer Web Application — Complete Implementation & Architecture Plan

## Executive Overview
**Next Archer** (`spiritualize-ai`) is a cross-platform React Native / React Native Web application built on **Expo 57**. It provides an AI-driven spiritual, wellness, and self-mastery companion experience featuring realtime solar sky rendering, mood-reactive aurora shaders, biometric scanning visualizers, chakra alignment modules, and multi-screen interactive workflows.

---

## Technical Stack & Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / CLIENT                              │
│         React 19 • React Native Web 0.21 • Metro Bundler (8081)        │
└────────────────────┬───────────────────────────────┬────────────────────┘
                     │                               │
┌────────────────────▼──────────────────┐ ┌──────────▼────────────────────┐
│      NAVIGATION & SCREEN STACK        │ │     DYNAMIC VISUAL ENGINE      │
│  @react-navigation/native-stack 7.x   │ │  WebGL Shaders & SVG Canvas    │
│  • AIChatDark      • LetsMatrix       │ │  • AmbientBackground           │
│  • AIChatLight     • Messages         │ │  • AuroraShaderBackground      │
│  • AuraScanner     • Challenge        │ │  • Solar Math Interpolation    │
│  • Supercharge     • Utopia           │ │  • Rain & Star Burst Engine    │
│  • HealMe / HealingSupercharge        │ └────────────────────────────────┘
└───────────────────────────────────────┘
```

- **Framework**: React Native 0.86 / React Native Web 0.21 / Expo 57
- **Bundler & Tooling**: Metro Bundler running on port `8081` with Babel JS transformation
- **Navigation**: `@react-navigation/native-stack` 7.x with `@react-navigation/native`
- **Graphics & FX**: `react-native-svg`, `expo-linear-gradient`, `expo-blur`, WebGL CSS keyframe curtains
- **Styling & Design System**: Custom HSL dark-mode theme, glassmorphic blurs (`backdrop-filter: blur(12px)`), responsive mobile-frame centered on desktop with `DesktopSidebar`.

---

## Key System Architecture & Core Modules

### 1. Dynamic Solar Ambience & Time-of-Day Engine
**Files**: `src/hooks/useSolarAmbience.ts`, `src/hooks/solarMath.ts`, `src/hooks/countryLatitude.ts`

- **Solar Timeline Interpolation**: Uses a 24-hour keyframed color gradient ramp (`SKY_KEYFRAMES`):
  - `00:00` — Midnight Deep Space (`#04060e`, `#090d1a`, `#04060e`)
  - `04:30` — Pre-dawn Dusk (`#070912`, `#0f1629`, `#1d1933`)
  - `06:00` — Sunrise Horizon (`#215985`, `#7ba8c9`, `#d68656`)
  - `12:00` — Solar Noon (`#1b6ba4`, `#9ec2df`, `#d68656`)
  - `19:00` — Twilight Sunset (`#141026`, `#2a1b42`, `#784768`)
- **Physics-Based Arc Math**: `easeInOutSine()` calculates sun elevation and east-to-west trajectory across the sky, dynamically calculating sunrise and sunset based on geographic latitude data.

---

### 2. Ambient Visual & Shader Render Engine
**Files**: `src/components/AmbientBackground.tsx`, `AuroraCurtains.tsx`, `AuroraShaderBackground.web.tsx`, `RainBackground.tsx`, `RainbowArc.tsx`, `Stars.tsx`

- **Aurora Borealis Shaders**: Rendered via animated multi-layer SVG curves and WebGL/CSS keyframe strands (`aurora-sway-a`, `aurora-sway-b`, `aurora-sway-c`) to create fluid, shimmering northern lights.
- **Starlight Twinkle Burst**: `useTwinkleBurst()` hook triggers a 33-second loop of flickering SVG stars whenever an energetic or spiritual chat interaction occurs.
- **Weather & Particle Overlay**: Raindrop vectors (`RainBackground`) and rainbow arcs (`RainbowArc`) overlay the sky dynamically based on conversation context.

---

### 3. Sentiment Analysis & AI Response Engine
**Files**: `src/screens/AIChatDarkScreen.js`, `src/screens/AIChatLightScreen.js`

- **Pattern Detection Engine**: Evaluates incoming user messages against three regex pattern buckets:
  1. `HEAVY_PATTERNS` — Sadness, anxiety, overthinking, burnout keywords (e.g., *sad*, *heavy*, *alone*, *staring at ceiling*).
  2. `HAPPY_PATTERNS` — Joy, gratitude, energy keywords (e.g., *happy*, *excited*, *grateful*, *amazing*).
  3. `MOTIVATIONAL_PATTERNS` — Focus, goal-setting, breakthrough keywords.
- **Ambiance Shift**: If heavy sentiment is detected, the engine auto-triggers comforting night sky colors and activates the manual Aurora glow to create a soothing atmosphere.
- **Contextual Bot Dispatch**: Simulates real-time typing indicators before replying with empathetic guidance, grounding exercises, or chakra recommendations.

---

### 4. Application Screen Stack & Navigation

```
                       ┌──────────────────────┐
                       │     SplashScreen     │
                       └──────────┬───────────┘
                                  │
                       ┌──────────▼───────────┐
                       │    AIChatDark (Home) │
                       └──────────┬───────────┘
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
│   AuraScanner   │      │   Supercharge   │      │     HealMe      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
│    LetsMatrix   │      │    Messages     │      │    Challenge    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
┌────────▼────────┐      ┌────────▼────────┐
│  AIChatLight    │      │     Utopia      │
└─────────────────┘      └─────────────────┘
```

| Screen File | Primary Purpose & Features |
| :--- | :--- |
| **`AIChatDarkScreen.js`** | Core dark-mode chat workspace with quick action cards, sentiment-based AI replies, audio voice wave animations, modal sub-menu options, and desktop sidebar integration. |
| **`AIChatLightScreen.js`** | Light-theme variant offering high-contrast solar morning visuals and clean conversation layout. |
| **`AuraScannerScreen.js`** | Interactive biometric/aura reader with rotating SVG concentric rings, real-time frequency scanning animations, and energy level metrics. |
| **`SuperchargeScreen.js`** | High-energy power-up suite featuring aura surges, motivational audio prompts, and vitality tracking. |
| **`HealMeScreen.js`** | Sound frequency healing & guided meditation player with interactive audio waveform visualizer bars. |
| **`HealingSuperchargeScreen.js`** | Combined chakra alignment & energy acceleration protocol with interactive chakra nodes. |
| **`LetsMatrixScreen.js`** | Reality distortion and subconscious reprogramming workspace with dark futuristic neon styling. |
| **`MessagesScreen.js`** | Community & mentor inbox containing conversation threads, unread badges, and quick-reply triggers. |
| **`ChallengeScreen.js`** | 30-day streak tracker featuring a live countdown timer (`setInterval` loop) for daily reflection goals. |
| **`UtopiaScreen.js`** | Vision board & intention manifestation workspace with interactive vision tiles and affirmation builder. |
| **`SplashScreen.js`** | Brand entry loading screen with smooth logo fade-in and transition to `AIChatDark`. |

---

### 5. Desktop Workspace Layout
**File**: `src/components/DesktopSidebar.js`

- **Dual-Mode Layout**: On desktop screens, the application renders a split view:
  - **Left Panel (Sidebar)**: Next Archer logo (`nextarcherlogo.jpeg`), *New Chat* primary button, *Recent Chats* list (`Morning Alignment`, `Deep Focus & Clarity`, `Cosmic Energy Check-in`, `Night Affirmations`), and user profile badge.
  - **Right Panel (Main Workspace)**: Centered mobile mockup wrapper (`webOuterContainer`) displaying the active stack screen with glassmorphic ambient backdrop.

---

## Resolved Issues & Current Status

- **Syntax Error Fix**: Corrected missing closing parenthesis on `setInterval` in `src/screens/ChallengeScreen.js#L48`.
- **Server Status**: Metro Bundler is running cleanly at **http://localhost:8081** serving the web app bundle.

---

## Verification Plan

### Automated Verification
- Verify JS code parsing with `@babel/parser` across all files in `src/` (passed).

### Manual Verification
- Access **http://localhost:8081** in browser.
- Test navigation between `AIChatDark`, `AuraScanner`, `Supercharge`, `HealMe`, `Challenge`, and `Messages`.
- Test typing text in AI Chat to verify sentiment pattern matching and simulated typing response.
