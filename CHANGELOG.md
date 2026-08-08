# Change Log

---

## [Unreleased] - 2026-08-08

### Backend Architecture Migration (Node.js Express → Python FastAPI)
- **FastAPI Core Application**: Replaced legacy Node.js Express server with Python FastAPI application (`backend/app/main.py`) extracted from the `origin/Backend` branch.
- **REST Endpoints & Routers**:
  - `auth.py`: User registration (`/auth/register`), login (`/auth/login`), profile (`/auth/me`).
  - `chat.py`: Spiritual AI Chat sessions (`/chat/sessions`), real-time messages, and chakra analysis (`/chat/sessions/{id}/end`).
  - `dashboard.py`: Telemetry (`/dashboard/telemetry`) & dynamic Maslow hierarchy matrix recomputation (`/dashboard/world-balance`).
  - `twin.py`: Digital Twin profile management (`/twin/profile`) enforcing `FirstName_2.0` rule, and execution queue (`/twin/runs`).
- **Dependencies & Environment**: Created `requirements.txt` (FastAPI, Uvicorn, Pydantic v2, PyJWT/python-jose, Bcrypt, Supabase, Email-Validator) and local Python `venv`. Added `schema_v2.sql` for PostgreSQL database migrations.
- **Groq AI Key Integration**: Integrated `GROK_API_KEY` with `llama-3.3-70b-versatile` model into `app/routers/chat.py` for real-time dynamic AI completions.
- **SMS OTP Router**: Added `app/routers/otp.py` supporting `/api/v1/otp/send` and `/api/v1/otp/verify` with Fast2SMS SMS gateway integration (`FAST2SMS_API_KEY`).
- **Face ID Login & Vector Registration**: Added `/api/v1/auth/face-register` and `/api/v1/auth/face-login` in `app/routers/auth.py` using 128-D pgvector Euclidean L2 distance matching ($\le 0.6$).
- **V2 Database Schema**: Updated `backend/schema_v2.sql` with full PostgreSQL schema definition including `pgvector`, `users`, `face_descriptors`, `chat_sessions`, `chat_messages`, `session_analysis`, `user_dashboard`, `digital_twins`, `micro_tasks`.
- **Environment & URL Alignment**: Configured `backend/.env` with Supabase Service Role Key, Groq API Key, Fast2SMS API Key, and set `VITE_BACKEND_URL=http://localhost:8000` / `EXPO_PUBLIC_BACKEND_URL=http://localhost:8000` across SPA and Expo chatscreen environments.
- **Universal Responsive Layouts (Mobile, Tablet, Desktop)**:
  - **Sidebar Breakpoint Fix (< 960px)**: Updated `isSmallScreen` threshold to `960px` in `AIChatDarkScreen.js` & `AIChatLightScreen.js`. `DesktopSidebar` is now automatically hidden on any screen or iframe width under `960px`, allowing the chat container to expand to 100% width with zero text compression or layout overlap.
  - **Mobile Navigation Drawer**: Added a top-left hamburger menu trigger (`Ionicons name="menu"`) on screens under `960px` to seamlessly open the glass sliding drawer (`showMobileDrawer`).
  - **Metro Bundler Syntax Fix**: Restored missing `<View style={styles.floatingHeader}>` container tag in `AIChatDarkScreen.js`, resolving Metro HTTP 500 transformation error and restoring `200 OK` bundle response on `http://localhost:8081`.
  - **Mobile Header & Bubble Alignment Fix**: Moved timer pill into subtitle row on small screens to eliminate top-center collision with "Hey Priya", simplified mobile header right action bar, and adjusted bubble `maxWidth` to `72%` with `paddingHorizontal: 18` so user bubbles ("Hi") are never cut off at the right edge.
- **Model Selector Dropdown Removal**: Completely removed the model selection dropdown pill ("Spiritualize AI / Digital Twin 🔒") and popover popups from `AIChatDarkScreen.js` and `AIChatLightScreen.js`. Simplified the input bar section to focus exclusively on Spiritualize AI chat.
- **Localhost Redirect Enforcement**: Replaced all Vercel production redirect links (`https://compiledchat.vercel.app`, `https://nextarcher.vercel.app`) with local port endpoints (`http://localhost:3000` for main app and `http://localhost:8081` for chat screen).
- **Reflection Cycle Timer Adjustment**: Updated reflection cycle timer threshold from 10 minutes (`600s`) to 2 minutes (`120s`) across both chat screens, with updated modal copy `"Your 2-minute reflection cycle is complete."`.
- **Database Foreign Key Safety**: Added parent user and session record upserts in `backend/app/routers/chat.py` to prevent PostgreSQL foreign key constraint errors (`23503`) during guest and default session message persistence.
- **Sanctuary Button Alignment Fix**: Removed `lg:mx-0` from `EnterHealingButton.jsx` and added `mx-auto flex justify-center items-center` to `HealMeScreen.jsx` so the primary "ENTER HEALING EXPERIENCE" button is mathematically centered on desktop viewports.
- **Healing Audio Toggle Controls**: Updated `HealingScreen.jsx` and `HealingButton.jsx` so clicking "Begin Healing" starts Solfeggio audio and transforms the button into a red glowing "Stop Healing" (`⏹ STOP HEALING`) control. Clicking it immediately halts audio playback (`stopSolfeggioTone()`) and resets visualizer state.
- **Digital Twin Auto-Synthesis & Soul Card (`/digital-twin`)**: Integrated automatic `GET /api/auth/digital-twin-name` twin name fetching (`FirstName_2.0`), removed twin name input field in `UnifiedSetupScreen.jsx`, rendered auto-synthesized name glass panel, cleaned up header nav, and fixed logo/typography rendering.
- **Digital Twin Desktop Workspace (`/chat` / `DigitalTwinChatScreen`)**: Upgraded starlight overlay with 140 twinkling stars across 100vw × 100vh bounds and removed top-right Aurora wave & Golden Moon icon buttons.
- **Daytime Solar Sun Assets (`Sun.jpeg`)**: Integrated high-fidelity `Sun.jpeg` realistic glowing sun disc across SVG `DaytimeSkyScene.tsx` and web/chatscreen `AmbientBackground.tsx` components.

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
