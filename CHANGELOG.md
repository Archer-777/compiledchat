# Change Log

---

## [Unreleased] - 2026-08-08

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
