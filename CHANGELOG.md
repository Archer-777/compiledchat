# Change Log

---

## [Unreleased] - 2026-08-09

- **UI Title & Greeting Update**: Changed header title to **"Life on Dashboard"** and greeting to **"Namaste, [User]"** on [DashboardHeader.jsx](file:///d:/Ansd/src/components/layout/DashboardHeader.jsx). Updated branding to "Life on Dashboard" across all sidebars, navbars, and buttons.
- **Git Release Pushed to GitHub**: Pushed all latest UI enhancements, direct Supabase DB chat persistence, live telemetry engine, and bug fixes to `origin/main` (`Archer-777/compiledchat.git`).
- **LocalStorage Wiped On Logout**: Implemented full `window.localStorage.clear()` on user logout ([GlobalNavbar.jsx](file:///d:/Ansd/src/components/layout/GlobalNavbar.jsx) & [storage.js](file:///d:/Ansd/src/utils/storage.js)) and strictly isolated chat sessions by active user email to prevent chat history leaking across accounts.
  - Center-aligned webcam camera logo icon, text, and "Enable Webcam" button vertically and horizontally inside the viewport frame in [AuraScannerPage.jsx](file:///d:/Ansd/src/pages/AuraScannerPage.jsx).
  - Changed page background to **pure solid black (`#000000`)** by setting `pureBlack={true}` on [AmbientBackground.jsx](file:///d:/Ansd/src/components/visuals/AmbientBackground.jsx).
  - Renamed **"Digital Twin"** ➔ **"Edit-Digital Twin"** (`👤 Edit-Digital Twin`).
  - Renamed **"Heal Me"** ➔ **"Act-Heal Me"** (`🔮 Act-Heal Me`).
  - Changed navigation sidebar drawer background color to **solid pure black (`#000000`)** in [GlobalNavbar.jsx](file:///d:/Ansd/src/components/layout/GlobalNavbar.jsx).
  - Renamed **"Chat"** ➔ **"Chat-SAI"** (`💬 Chat-SAI`).
  - Renamed **"Twin Chat"** ➔ **"Chat-TWIN"** (`🤖 Chat-TWIN`).
  - Configured **"Heal Me"** menu item (`🔮 Heal Me`) to redirect directly to the **Chakra Healing Screen** (`/healing`).
  - Removed separate **"Chakras"** option (`🧘 Chakras`) from the navigation sidebar ([GlobalNavbar.jsx](file:///d:/Ansd/src/components/layout/GlobalNavbar.jsx)).
  - Changed user name text color (`✦ [User Name]`) from cyan/blue to **pure white (`#ffffff`)** in [GlobalNavbar.jsx](file:///d:/Ansd/src/components/layout/GlobalNavbar.jsx).
  - Changed **NAVIGATION** drawer title text color from cyan/blue to **pure white (`#ffffff`)**.
  - Removed circular logo icon next to the **NAVIGATION** title in the drawer header.
- **Fix: Bearer Auth Token Username/Display Name**: Updated `DigitalTwinChatScreen.jsx` to pass the human user's display name or username in `Authorization: Bearer <username>` (e.g. `Bearer Ashish` or `Bearer Guest`) instead of a raw UUID, matching AI Team API specifications.
- **Fix: End Session Sending Real Chat Messages**: Updated `ChatScreenPage.jsx` to read actual conversation messages from `localStorage('@spiritual_chat_sessions')` and pass them with user email to the `/analyze` endpoint, replacing the hardcoded dummy text.
- **Fix: `getLatestTelemetry` Hardcoded Maslow Scores**: Updated `chatController.js` to check for `telemetry_json` column first (full blob), then fall back to real DB column values instead of hardcoded defaults.
- **Fix: Full Telemetry JSON Persisted to DB**: `analyzeSession` now also saves `telemetry_json` (complete analysis output) and `balanced_thinking` to the `user_profiles` upsert call.
- **DB Migration Created**: Added `backend/migration_add_telemetry_columns.sql` to add telemetry columns (`karma_rating`, `my_world_*`, `collective_intelligence`, `global_consciousness`, `balanced_thinking`, `weak_chakras`, `telemetry_json`) to `public.users` table and recreate `user_profiles` view.

- **Spiritualize AI API Connection & Groq Streaming Fallback**: Resolved `TypeError: network error` when calling Spiritualize AI streams. Refactored `backend/src/controllers/chatController.js` and `backend/src/config/grok.js` with a 4-second timeout on primary upstream endpoint and automatic fallback to Groq AI Engine (`groq-sdk` with `llama-3.3-70b-versatile`) streaming for real-time spiritual guidance and telemetry analysis.

- **Twin AI JWT/Bearer Authentication**: Integrated user identification Bearer headers (`Authorization: Bearer <user_id>`) into `DigitalTwinChatScreen.jsx` for all Twin API calls (`/runs` and `/runs/:id`) per backend specification.
- **Strict Local Chat Session Isolation**: Enforced strict email-based filtering (`userEmail === activeEmail`) in `storage.js` for local chat sessions to prevent untagged local storage sessions from leaking across different user accounts.
- **Digital Twin Name Auto-Synthesis**: Hardcoded Digital Twin name to dynamically synthesize as `[User First Name] 2.0` across setup screens and Twin Chat screen (`DigitalTwinPage.jsx`, `DigitalTwinChatScreen.jsx`).
- **Chat Output `.py` Script Filter**: Updated `DigitalTwinChatScreen.jsx` to filter out `.py` generator scripts from the displayed AI response files list, ensuring users only see final generated documents (e.g., PDFs).
- **Header Brand Styling & Scaling**: Updated "NEXT ARCHER" branding text to Title Case ("Next Archer"), increased logo dimensions (56px) and text size (24px) for high visibility across `GlobalNavbar.jsx` and `AppHeader.jsx`.
- **Production Deployment Plan Documentation**: Created `deployment_plan.md` artifact outlining environment variables and step-by-step Railway (Backend) and Vercel (Frontend) deployment guidelines.

- **Sun Image Replacement & Glowing Effect**: Synced the newly added `D:\Ansd\public\Sun.jpeg` to the `chatscreen/assets` directory. Updated the `GlowingCornerSun` component in both `chatscreen/src/components/AmbientBackground.tsx` and `src/components/visuals/AmbientBackground.tsx`. Changed the image container's `overflow` from `hidden` to `visible` and applied a golden shadow (`#FFD700` with 25px radius) to create a seamless glowing effect around the new sun asset, while restoring its opacity to 1.
- **Vite 404 Broken Image Fix**: Fixed broken Desktop Workspace logo icon in Vite web builds by strictly correcting the case-sensitive path to match the real file on disk (from `src="/Logo_in_White.svg"` to `src="/logo_in_white.svg"`) across `DigitalTwinChatScreen.jsx` and `UnifiedSetupScreen.jsx`.
- **Metro MIME Type 500 Error Fix & Logo Replacement**: Resolved HTTP 500 error and script MIME type execution failure by replacing invalid ES module import paths with native React Native `require('../../assets/Logo_in_White.svg')` asset calls across `DesktopSidebar.js`, `AIChatDarkScreen.js`, and `AIChatLightScreen.js`. Replaced all occurrences of the old `>><]>` logo with your clean white vector `Logo in White (1).svg` design (`D:\Ansd\Logo in White (1).svg`).
- **Brand Logo Asset Replacement (`Logo in White (1).svg`)**: Replaced all occurrences of the old brand logo (`nextarcherlogo.jpeg`) with `D:\Ansd\Logo in White (1).svg` across desktop sidebars (`DigitalTwinChatScreen.jsx`, `DesktopSidebar.js`), mobile navigation glass drawers (`DigitalTwinChatScreen.jsx`, `AIChatDarkScreen.js`, `AIChatLightScreen.js`), session completion modals (`AIChatDarkScreen.js`, `AIChatLightScreen.js`), and setup screens (`UnifiedSetupScreen.jsx`).
- **2.svg Asset Sync & Module Import Fix**: Copied the real 1.44 MB `D:\Ansd\2.svg` logo asset over to `chatscreen/assets/2.svg`, `src/assets/2.svg`, and `public/2.svg` (replacing the old 1.5 KB placeholder `>><]>` SVG file). Updated `AIAvatar` across `AIChatDarkScreen.js` and `AIChatLightScreen.js` to import `aiLogoSvg` via ES6 static import, replacing the old `>><]>` text logo with your actual `2.svg` logo image.
- **Aurora Glitch JPEG ES6 Module Import Fix**: Changed image resolution strategy to use direct ES6 module import (`import auroraGlitchImg from '../../assets/aurora_glitch.jpeg'`) across `AIChatDarkScreen.js` and `AIChatLightScreen.js`. This ensures the JPEG asset is bundled directly into the application build, fixing the blank dark placeholder circle and displaying your `D:\Ansd\Aurora as glitch.jpeg` image in a clean 38px circle without extra borders.
- **Aurora Toggle Button JPEG Full Circle Asset (`Aurora as glitch.jpeg`)**: Updated the Aurora toggle button across `AIChatDarkScreen.js` and `AIChatLightScreen.js` to load the newly placed `Aurora as glitch.jpeg` asset (copied from `D:\Ansd\Aurora as glitch.jpeg`). Formatted the button to display as a full, seamless 38px circular image (`borderRadius: 19`, `overflow: 'hidden'`, `resizeMode: 'cover'`) with all outer borders, padding, and container background rings removed.
- **Aurora Toggle Icon Cache & Reload Fix**: Synced the updated `Aurora as glitch.svg` (493KB) asset across `public/aurora_glitch.svg`, `src/assets/aurora_glitch.svg`, and `chatscreen/assets/aurora_glitch.svg`. Updated `Image` sources in `AIChatDarkScreen.js` and `AIChatLightScreen.js` to serve `{ uri: '/aurora_glitch.svg' }` directly on web to bypass Metro bundler static asset caching.
- **Twin Chat File Download Cards**: Added clickable file download cards below AI responses when the backend returns files. Each card shows file icon, filename, and download arrow. Downloads use the API's `download_url` field linking to `GET /sessions/{session_id}/files/{filename}`.
- **Twin Chat Polling Fix**: Fixed stuck "Thinking..." by matching actual API status `"succeeded"` (not just `"completed"/"success"`) and extracting response from `"text"` field (the actual FastAPI response key).
- **Digital Twin & Twin Chat Production Implementation**: Wired Twin Chat (`/twin-chat`) to production FastAPI backend at `http://65.2.37.177:8000`. Replaced broken `localhost:4000` chat endpoint with `POST /runs` + `GET /runs/{run_id}` polling (3s intervals, 60 max). Removed 5 hardcoded dummy messages and replaced with single clean welcome. Removed broken `localhost:4000` profile fetch/save calls from `DigitalTwinChatScreen.jsx` and `DigitalTwinPage.jsx` (localStorage works as primary storage). Added markdown rendering for twin responses (bold, italic, code, headings, lists). Added "Thinking..." animation indicator during polling. Loaded twin persona name from localStorage and displayed in header subtitle. Added missing `getUserData` import.
- **Profile Button Full Circle Image**: Removed the dark transparent border container around the profile icon and expanded `user_icon.svg` to fill the full 34px circular button (`borderRadius: 17`, `overflow: 'hidden'`) across `AIChatDarkScreen.js`, `DigitalTwinChatScreen.jsx`, and `DesktopSidebar.js`.
- **Profile Button Icon (`user_icon.svg`)**: Replaced the header profile button icon and dropdown profile menu icon with `user_icon.svg` across `AIChatDarkScreen.js`, `DigitalTwinChatScreen.jsx`, and `DesktopSidebar.js`.
- **Aurora Toggle Button Asset (`Aurora as glitch.svg`)**: Replaced the header aurora toggle button icon with `aurora_glitch.svg` (copied from `D:\Ansd\Aurora as glitch.svg`) across `AIChatDarkScreen.js` and `AIChatLightScreen.js`.
- **User Icon Asset Integration (`user_icon.svg`)**: Replaced the legacy smiley face user avatar with the custom `user_icon.svg` image asset across `AIChatDarkScreen.js`, `AIChatLightScreen.js`, and `DigitalTwinChatScreen.jsx`. Copied `user_icon.svg` into asset directories (`chatscreen/assets/user_icon.svg`, `src/assets/user_icon.svg`, and `public/user_icon.svg`).
- **Circular AI Avatar Disc Clipping**: Applied `borderRadius: 17` and `overflow: 'hidden'` to `AIAvatar` in `AIChatDarkScreen.js` and `AIChatLightScreen.js`, cleanly clipping the square black logo background into a crisp circular avatar disc without any outer blue border or square corners.
- **AI Avatar Boundary Circle Removal**: Completely removed the outer blue background circle (`backgroundColor`, `borderColor`, `borderWidth`) from `AIAvatar` in `AIChatDarkScreen.js` and `AIChatLightScreen.js`. Only the clean `2.svg` logo image is now displayed without any bounding circle or color outline.
- **Metro Bundler Syntax Error Fix**: Fixed a duplicate closing block syntax error on line 47 of `AIChatDarkScreen.js` (`AIAvatar` component), resolving HTTP 500 Metro bundling errors and MIME type script execution failures (`index.bundle`).
- **Spiritualize AI Chat Avatar Icon (`2.svg`)**: Replaced the legacy inline Svg avatar icon with the branded `2.svg` image asset across Spiritualize AI chat screens (`AIChatDarkScreen.js` and `AIChatLightScreen.js`). Copied `2.svg` into asset directories (`chatscreen/assets/2.svg`, `src/assets/2.svg`, and `public/2.svg`).
- **Sign Out Integration & Session Purge**: Fixed Sign Out functionality across `GlobalNavbar.jsx`, `AIChatDarkScreen.js`, and `App.jsx`. Added explicit `clerk.signOut()` trigger to ensure Clerk session is destroyed on sign out (preventing `ClerkUserSync` from immediately re-populating `@active_auth_session`), purged local storage keys (`@active_auth_session`, `@spiritual_register_user`, `user_profile`, `@telemetry_analysis_result`), and redirected users to `/scan`.
- **Cross-Origin Telemetry Redirect Sync**: Added URL query parameter encoding (`?telemetry=...`) when redirecting from Metro Web chat (port 8081) or main app header (port 3000) to `SoulMatrixPage.jsx`. `SoulMatrixPage.jsx` parses `?telemetry=...` on mount, syncs `localStorage` across origins, and instantly updates all 0-baseline Soul Matrix values with the model's computed telemetry.
- **PostgreSQL `password_hash` Constraint Fix**: Added `password_hash: ''` default value to `users` table upserts in `App.jsx` and `schema_v2.sql`, resolving Supabase HTTP 400 Bad Request errors.
- **PostgreSQL Schema V2 & Supabase Upsert Fix**: Removed PostgreSQL `full_name` generated column from `users` table upsert payloads across `App.jsx` and `storage.js` to eliminate HTTP 400 Bad Request errors. Added `user_profiles` compatibility view to `schema_v2.sql` and `schema.sql` (`session_type TEXT DEFAULT 'spiritual'` on `chat_sessions`) to resolve 404 errors.
- **SVG `<circle>` Attribute `r` Safety**: Resolved `Error: <circle> attribute r: Expected length, "undefined"` in `ChakraFigure.jsx` by creating a robust score calculation helper with numeric fallbacks (`r = 3.5 + norm * 2.0`).
- **New User Zero-Baseline Soul Matrix Dashboard**: Configured initial default Soul Matrix profile values (`karma_rating`, `maslow_levels`, `chakras`, `my_world_sliders`, `growth_consciousness`) to 0 for newly registered users. All values update dynamically upon receiving the SAI telemetry engine model analysis output when "End Session" is triggered.
- **SAI Conversation Analysis & Consciousness Telemetry Engine**: Integrated system prompt and `/api/v1/chat/sai/analyze` endpoint into Node backend (`chatController.js` and `chat.routes.js`). When the "End Session" button is triggered in chat screens (`AIChatDarkScreen.js` and `AIChatLightScreen.js`), the full conversation transcript is analyzed to derive structured psychological, Maslow, chakra (`root`, `sacral`, `solar_plexus`, `heart`, `throat`, `third_eye`, `crown`), weak chakras, truth ($T = T_i + T_w + T_k$), consciousness ($C = C_i + C_m + C_x$), energy ($E = T + C$), world balance, and growth metrics. Values are stored in `@telemetry_analysis_result` and dynamically populate the frontend personal growth dashboard (`SoulMatrixPage.jsx`).
- **Splash Screen Background Integration**: Blacked out the central background directly under and surrounding the logo image in `SplashPage.jsx` (`#050510`), and relocated the ambient aurora glow blobs to the four outer screen corners for 100% seamless image integration without box outlines.
- **Splash Image White Glow Filter Removal**: Removed the `drop-shadow` white glow filter from `2.svg` image in `SplashPage.jsx`.
- **Solid Black Splash Screen Background**: Updated `SplashPage.jsx`, `SplashPage.css`, and the `App.jsx` overlay container to `#000000` (pure solid black background).
- **Splash Image Seamless Background Blending**: Applied `mixBlendMode: 'screen'` and radial mask gradient to `2.svg` in `SplashPage.jsx`, seamlessly merging the logo into the ambient dark space background without bounding box artifacts.
- **Splash Screen Logo Image Replacement**: Replaced the halo SVG, AI typography, and smile arc element on `SplashPage.jsx` with `2.svg` image asset (`/2.svg`).
- **Page Refresh Splash Screen Overlay**: Configured full-screen `<SplashPage>` overlay in `App.jsx` to render on initial React app mount / browser page refresh on any route, playing the 2.8s logo animation before revealing page content.
- **Healing Audio Toggle Fix**: Refactored `stopSolfeggioTone()` in `src/utils/audio.js` to immediately stop oscillator nodes and close `AudioContext` without throwing on Web Audio exponential ramps. Eliminated duplicate `playSolfeggioTone()` calls in `HealingScreen.jsx` so clicking "Stop Healing" instantly halts audio playback.
- **Healing Header Bar Minimization**: Added a compact, high-tech `✦ SOLFEGGIO CHAKRA THERAPY` status badge with a pulsing active-color energy dot to the left side of `HealingScreen.jsx` header bar, eliminating empty bar space.
- **Registration Buttons Removal**: Removed `First-Time User? Complete Registration →` action buttons (both top navbar purple pill and bottom dark translucent button) from `HealingScreen.jsx` and `TravelModeScreen.jsx`.
- **Direct Chat Screen Redirection**: Removed intermediate Supercharge Screen step from the primary scan flow. Updated `handleContinue` in `AuraScannerPage.jsx` and `/chat` routing in `App.jsx` to navigate users directly to the AI Chat Screen on port 8081.
- **Backend API Port Alignment**: Fixed `VITE_BACKEND_URL` in `.env` and `.env.local` to target `http://localhost:4000` where the Node Express backend server is running (resolving connection failures caused by target port 8000).
- **Clerk React (Vite) Authentication Integration**:
  - **SDK Installation**: Installed `@clerk/react@latest` package.
  - **Environment Configuration**: Created `.env.local` configuring `VITE_CLERK_PUBLISHABLE_KEY`.
  - **Root Application Provider**: Wrapped `<App />` with `<ClerkProvider afterSignOutUrl="/">` in `src/main.jsx`.
  - **Aura Scanner Clerk Auth Buttons**: Integrated `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, and `<Show>` into the Alternative Sign In modal on `AuraScannerPage.jsx`.
- **Sentiment Analysis Scanner Refactoring**:
  - **Renamed Component Page & Branding**: Renamed "Aura Scanner" to **`SENTIMENT ANALYSIS SCANNER`** across page headers, status pills, and diagnostic logs in `AuraScannerPage.jsx`.
  - **Sentiment Focused Predictions**: Updated `auraPredictionService.js` to compute facial emotion valence scores, emotional tone, and mental clarity metrics.
- **Dynamic Sentiment Score Variation & Archer Guest Logout**:
  - **Dynamic Facial Feature Score Variance**: Refactored `auraPredictionService.js` to compute realistic, varied valence scores (61.2% - 99.6%), emotional tone percentages, and clean sentiment indices dynamically generated from facial descriptor seeds and emotion probabilities.
  - **Archer Guest Mode Sign-Out Flow**: Updated `handleLogout` in `App.jsx` and `handleLogoutAction` in `GlobalNavbar.jsx` to clear local auth state, sign out active sessions, and reset the active user profile strictly to **`Archer` (Guest Mode)** (`isGuest: true`).
- **User Identity Name Retrieval & Database Sync**:
  - **Automatic Session & DB Sync Hook**: Created `ClerkUserSync` component in `App.jsx` that listens to Clerk's `useUser()` hook, retrieves `user.firstName`, `user.lastName`, and `user.email`, populates local session caches (`@active_auth_session`, `@spiritual_register_user`), and automatically upserts user records into PostgreSQL database `users` & `user_profiles` tables.
- **14-Archetype Dynamic Sentiment Engine & High-Tech Display**:
  - **Dynamic Sentiment Archetypes**: Expanded `auraPredictionService.js` with 14 high-precision sentiment archetypes (*Serene Equilibrium*, *Zen Resonance*, *Mindful Stillness*, *Radiant Optimism*, *Cognitive Sharpness*, *Luminous Joy*, *Intuitive Depth*, etc.) dynamically selected based on facial expression vectors and landmark seeds.
  - **Futuristic Prediction Card UI**: Redesigned prediction card in `AuraScannerPage.jsx` featuring glowing gradient title typography, dynamic category tag pills (e.g. `✦ NEURAL RESONANCE`, `✦ MENTAL AGILITY`), glowing valence score badges, and crisp 1-sentence summaries.
- **Natural Photo Capture Output**:
  - **Removed Canvas Aura Composition**: Refactored `removeBackgroundAndCompositeAura` in `src/services/faceRecognitionService.js` to return 100% natural, clean camera frame captures without purple background gradients, star particles, radial arc halos, or holographic border overlays.
- **Per-User Chat Session History Isolation**:
  - **Eliminated Global Leaks**: Replaced unfiltered `/chat_sessions` DB calls with `user_id=eq.${targetUserId}` queries so each authenticated user strictly accesses their own private chat sessions in the sidebar.
- **Localhost Environment & Service Launch**:
  - **Local Development Environment**: Configured local development pipeline across Node Express Backend (port 4000), Metro/Expo Web Chat Screen (port 8081), and Vite React Main App (port 3000).
  - **Vercel Redirect Exclusion**: Enforced all internal navigation, iframe proxying (`/chatscreen-app/`), and API endpoints strictly to `localhost` URLs without external redirects to Vercel.

## [1.3.0] - 2026-08-08


- **Unlimited Chat Duration for Registered Users**:
  - **Removed Session Timer Cutoff**: Updated `AIChatDarkScreen.js` and `AIChatLightScreen.js` timer logic (`if (isGuest && next === 120)`). Registered users now have **unlimited chat duration** with zero session completion modals or time limits.
  - **Header Status Badge**: Displayed a cyan **`⚡ UNLIMITED`** status pill in top header for logged-in registered users, signifying active unlimited access.
  - **Guest Reflection Preserved**: Maintained 2-minute trial reflection countdown modal strictly for unauthenticated guest visitors (`isGuest === true`).
- **Session Completion Redirect to Register Page**:
  - **Register Page Redirection**: Updated `Session Completed` modal action button in `AIChatDarkScreen.js` and `AIChatLightScreen.js` to redirect users directly to `http://localhost:3000/register` (`Proceed to Register ✨`).
  - **Iframe Parent Navigation**: Handled iframe context safely (`window.parent.location.href`), ensuring top-level window redirection when embedded within main app.
- **Real-Time Voice Input (Web Speech API Integration)**:
  - Replaced static placeholder alert for microphone button in `AIChatDarkScreen.js` and `AIChatLightScreen.js` with active browser speech recognition (`window.SpeechRecognition` / `window.webkitSpeechRecognition`).
  - Added real-time speech-to-text transcription directly into chat input field (`inputText`).
  - Implemented active listening UI feedback (glowing red pulsing mic button & status toasts when listening starts/stops).
- **Full Chat Database Persistence & New Chat Session Engine**:
  - **Supabase DB & Local Chat Storage**: Implemented `saveChatSession()` and `getChatSessions()` in `storage.js`. Every sent message and AI completion is automatically persisted in real time to both remote Supabase `chat_sessions` DB and local storage.
  - **`+ New Chat` Button Functionality**: Clicking **`+ New Chat`** auto-saves active conversation to history, generates fresh session ID, resets chat screen state, and updates `RECENT CHATS` in real time.
  - **Chat Session Restoration**: Wired `onSelectHistoryItem()` so clicking any past chat in `RECENT CHATS` instantly loads and restores that complete conversation history.
- **Chat Screen Text Input Focus Box & Autocomplete Removal**:
  - **Eliminated Black Focus Box**: Enforced `outlineStyle: 'none'` and `outlineWidth: 0` on TextInput components and added global CSS rules (`input, textarea { outline: none !important; box-shadow: none !important; }`).
  - **Disabled Browser Autocomplete & Spellcheck Popups**: Added `autoComplete="off"`, `autoCorrect={false}`, and `spellCheck={false}` to TextInput elements, eliminating floating black suggestion tooltips.
- **Sidebar Navigation Drawer UI Refinement**:
  - **Removed Light/Dark Theme Switcher Button**: Completely removed `Switch Light Theme` / `Switch Dark Theme` toggle button from chat screens.
  - **Simplified Button Label**: Renamed `Heal Me Sanctuary` to **`Heal Me`** across chat screens and `GlobalNavbar.jsx` (`🔮 Heal Me`).
- **Chakra / Healing Screen UI Cleanup**:
  - **Removed First-Time User Registration Button**: Removed `First-Time User? Complete Registration →` action button from `HealingScreen.jsx` and `TravelModeScreen.jsx` for clean Solfeggio sound therapy.
- **Left-Aligned Mobile & Overlay Navigation Drawer**:
  - **Left Side Drawer Slide**: Relocated sliding glass navigation drawer to open on the **LEFT** side of the screen when clicking menu button (`☰`).
  - **Consistent Left Sidebar Placement**: Ensured both `DesktopSidebar` (desktop view) and mobile glass drawer open cleanly on the **LEFT** side of viewport.
- **Supabase Database Fetching & Direct Synchronization**:
  - **Primary Supabase Fetching**: Updated `getUserData()` in `storage.js` to query Supabase `user_profiles` table loading registered names, professions, phones, and metadata directly from DB.
  - **Automatic Supabase Upsert Sync**: Added `syncUserToSupabase()` in `AuraScannerPage.jsx`, automatically saving authenticated alternative sign-in profiles directly into remote Supabase `user_profiles` table.
- **Guest Profile Privacy Protection**:
  - **Strict Guest Session Resolution**: Standardized local session parsing across `storage.js`, `App.jsx`, `DesktopSidebar.js`, `AIChatDarkScreen.js`, and `AIChatLightScreen.js` to enforce `parsed.isGuest === false && parsed.email` before recognizing registered user profiles.
  - **Profile Footer Hidden for Guests**: Strictly hid user profile footer card (`Priya / Registered User`) at the bottom of `DesktopSidebar.js` for unauthenticated guest users ("Archer").
- **Digital Twin Auto-Synthesis & Soul Card (`/digital-twin`)**: Integrated automatic `GET /api/auth/digital-twin-name` twin name fetching (`FirstName_2.0`), removed twin name input field in `UnifiedSetupScreen.jsx`, rendered auto-synthesized name glass panel, cleaned up header nav, and fixed logo/typography rendering.
- **Digital Twin Desktop Workspace (`/chat` / `DigitalTwinChatScreen`)**: Upgraded starlight overlay with 140 twinkling stars across 100vw × 100vh bounds and removed top-right Aurora wave & Golden Moon icon buttons.
- **Daytime Solar Sun Assets (`Sun.jpeg`)**: Integrated high-fidelity `Sun.jpeg` realistic glowing sun disc across SVG `DaytimeSkyScene.tsx` and web/chatscreen `AmbientBackground.tsx` components.
- **Sanctuary Button Alignment Fix**: Removed `lg:mx-0` from `EnterHealingButton.jsx` and added `mx-auto flex justify-center items-center` to `HealMeScreen.jsx` so the primary "ENTER HEALING EXPERIENCE" button is mathematically centered on desktop viewports.
- **Healing Audio Toggle Controls**: Updated `HealingScreen.jsx` and `HealingButton.jsx` so clicking "Begin Healing" starts Solfeggio audio and transforms the button into a red glowing "Stop Healing" (`⏹ STOP HEALING`) control. Clicking it immediately halts audio playback (`stopSolfeggioTone()`) and resets visualizer state.

---

## [1.2.0] - 2026-08-07

### Authentication & Deployment
- **Root Auth State Management**: Implemented root authentication state management and protected routing in `App.jsx`.
- **Production URL Redirects**: Updated profile logo and session-end redirect targets to production Vercel deployment URLs.
- **Vercel Routing**: Added `vercel.json` rewrite rules for main app and Expo web chat screen.
- **Supabase Auth Sync**: Integrated full end-to-end flow with Supabase authentication synchronization and dynamic user display name resolution.
- **Responsive Layout**: Integrated mobile responsive hamburger menu across primary navigation header.

---

## [1.1.0] - 2026-08-06

### User Flow Restructuring
- **AuraScannerPage**: Removed the Aura Sticker Studio button and eliminated the webcam aura color overlay field.
- **SuperchargePage**: Updated `Start Supercharging` button to redirect to the AI Chat Screen (`/chat`).
- **ChatScreenPage**: Added `End Session & Heal Me ✨` button to redirect users to the Heal Me Screen (`/heal-me`).
- **HealMePage & HealMeScreen**: Positioned sanctuary chat controls and routing options for session initialization.
- **HealingPage & HealingScreen**: Integrated `First-Time User? Complete Registration →` action buttons in top navbar and primary CTA.
- **RegisterPage**: Updated final registration completion button to redirect to Digital Twin Screen (`/digital-twin`).
- **Global Returning User Navbar**: Created `GlobalNavbar.jsx` (`src/components/layout/GlobalNavbar.jsx`) and integrated it into `App.jsx`.

### Initial Setup
- Initialized `CHANGELOG.md` for recording ongoing codebase modifications.
- Configured project rules in `.agents/AGENTS.md`.
