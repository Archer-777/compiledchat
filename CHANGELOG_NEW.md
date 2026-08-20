# Next Archer — New Changelog (Session 2026-08-14 Onwards)

All new enhancements, refactors, configuration updates, and bug fixes made from this session onwards are documented here.

---

## [Digital Twin: 0ms Instant Local-First Chat History Loading] - 2026-08-20

### Problem
Chat history was taking 3–5 seconds to appear because initial state waited for sequential remote network calls (`getUserData` ➔ `sync-user` ➔ `getChatSessions` ➔ `getChatMessagesForSession`).

### Changes

#### Storage: [`src/utils/storage.js`](file:///d:/Raj/compiledchat/src/utils/storage.js)
1. **`getLocalChatSessions` Synchronous Reader** — Instant 0ms synchronous local cache reader for recent sessions list and cached messages.

#### Frontend: [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)
1. **Synchronous React State Initializers** — `currentSessionId`, `recentSessions`, and `messages` are initialized synchronously in 0ms from localStorage upon component mounting.
2. **Non-Blocking Background Revalidation** — Remote user/session sync runs silently in the background without delaying UI render.

---

## [Digital Twin: Duplicate Message Bubble Deduplication & Storage Fix] - 2026-08-20

### Problem
In some scenarios, identical user prompt bubbles were duplicated ("Create a pdf in which hi is written" shown twice), and `getChatSessions` had a variable reference error on `data.map`.

### Changes

#### Storage: [`src/utils/storage.js`](file:///d:/Raj/compiledchat/src/utils/storage.js)
1. **Fixed Variable Name in `getChatSessions`** — Corrected `remoteList` reference to `data.map(...)` when merging backend rows with local cache.

#### Frontend: [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)
1. **`displayMessages` Deduplication Memo** — Filters out consecutive duplicate user prompt bubbles with identical text and duplicate IDs before rendering to UI.
2. **Active Task Guard in `loadSessions`** — Prevents auto-restore from firing when a task is currently in progress (`isThinking`).

---

## [Digital Twin: User Scroll Lock & Smart Auto-Scroll Fix] - 2026-08-20

### Problem
When typing or waiting for AI task responses, any upward scroll by the user to read previous chats was being hijacked and pulled back down repeatedly due to unconstrained `scrollIntoView` triggers on state ticks and session listener events.

### Changes

#### Frontend: [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)
1. **Scroll Boundary Detection (`isNearBottomRef`)** — Track user scroll distance from bottom. Only auto-scrolls down if user is within 120px of the bottom.
2. **Smooth Upward Scrolling** — If user scrolls up to review history, auto-scroll is completely paused so they can read freely.
3. **Guarded Session Auto-Restore** — `loadSessions(true)` runs auto-select only once on initial mount (`initialAutoRestoreDone.current`), preventing background events from resetting chat scroll.

---

## [Digital Twin: Chat History Self-Healing & Auto-Restoration] - 2026-08-20

### Problem
When navigating away from Digital Twin to other pages (HealMe/Dashboard) and returning, previous chat history was not auto-loaded, and clicking older sessions showed missing user prompts (only showing AI answers) due to remote session list overwriting local message caches.

### Changes

#### Storage: [`src/utils/storage.js`](file:///d:/Raj/compiledchat/src/utils/storage.js)
1. **Cache-Preserving Remote Merge in `getChatSessions`** — When updating session lists from the backend, merged with local cached `messages` so rich payloads (files, works data) are not wiped out.

#### Frontend: [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)
1. **Self-Healing Prompt Reconstruction in `handleSelectSession`** — If a loaded session has missing user prompts, it automatically reconstructs the user message from the session title and inserts it ahead of the AI response.
2. **Auto-Restoring Previous Active Session on Mount** — If no active task run is currently in flight, `loadSessions` automatically restores the user's latest conversation (`@twin_last_active_session_id` or `recentSessions[0]`) instead of showing an empty greeting screen.
3. **Immediate Pre-Save on Send** — User message is saved immediately to session storage before dispatching the API run.

---

## [Digital Twin: Navigate-Away Output Recovery] - 2026-08-20

### Problem
If user navigates to Dashboard (or any other page) while Digital Twin AI is processing, the output is lost because React unmounts the component and kills the polling loop. Coming back starts a fresh blank session.

### Changes

#### Frontend: [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)
1. **`@twin_active_run` localStorage persistence** — On run start, saves `{runId, sessionId, userPrompt}` to localStorage. Cleared on completion/error.
2. **Auto-resume on mount** — New `useEffect` checks for pending run on component mount. Restores session messages, checks run status, and either shows completed output immediately or resumes live polling.
3. **Session ID restoration** — Initial `currentSessionId` state reads from localStorage pending run instead of always generating a new UUID.

### Revert Instructions
```bash
git revert <commit-hash>
```

---

## [Digital Twin Connection Resilience Fix] - 2026-08-20

### Problem
Intermittent "Could not connect to the Digital Twin backend" errors on some devices. Root cause: stale keep-alive sockets between Railway Node.js proxy and upstream Python API (`65.2.37.177:8000`), plus leaked SSE connections exhausting server socket limits.

### Changes

#### Backend: [`backend/src/controllers/twinController.js`](file:///d:/Raj/compiledchat/backend/src/controllers/twinController.js)
1. **`fetchWithRetry()` helper** — 3 retries with exponential backoff (300/800/1500ms) on transient network errors (ECONNRESET, socket hang up, fetch failed, ETIMEDOUT).
2. **`Connection: close` header** on all upstream requests — forces fresh TCP socket per request, preventing stale keep-alive reuse.
3. **`TWIN_UPSTREAM` env var** — upstream URL centralized in `TWIN_UPSTREAM_URL` env var (default: `http://65.2.37.177:8000`), replacing 5 hardcoded occurrences.
4. **SSE stream auto-cleanup** — `req.on('close')` in `streamAgentEvents` immediately destroys upstream socket when client disconnects.
5. **502 status codes** — `enqueueAgentRun` and `getAgentRun` now return 502 (Bad Gateway) instead of 500 on upstream failures.

#### Frontend: [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)
1. **Silent 1-retry** on `POST /runs` with 1s delay before showing error to user.

### Revert Instructions
To revert this change:
```bash
git diff HEAD~1 -- backend/src/controllers/twinController.js src/pages/DigitalTwinChatScreen.jsx | git apply -R
```
Or revert the specific commit:
```bash
git revert <commit-hash>
```

---

## [Local Development & Redirection Transition] - 2026-08-14

### 1. Environment Configuration & Secrets Provisioning
- **Backend Configuration ([`backend/.env`](file:///d:/Raj/compiledchat/backend/.env))**:
  - Configured live credentials for Supabase, Groq AI SDK (`gsk_...`), SAI DeepSeek (`sk-live-...`), Fast2SMS OTP gateway, and JWT security keys.
  - Added localhost development CORS origins (`http://localhost:5173`, `http://localhost:8081`, `http://localhost:3000`, `http://localhost:5174`).
  - Set default server port to `4000`.
- **Frontend Configuration ([`.env`](file:///d:/Raj/compiledchat/.env))**:
  - Configured `VITE_BACKEND_URL="http://localhost:4000"`, `VITE_CHAT_APP_URL="http://localhost:8081"`, and `VITE_MAIN_APP_URL="http://localhost:5173"`.
  - Configured Supabase project URL and anonymous API keys.
- **Chat Screen Configuration ([`chatscreen/.env`](file:///d:/Raj/compiledchat/chatscreen/.env))**:
  - Configured `EXPO_PUBLIC_BACKEND_URL="http://localhost:4000"`, `EXPO_PUBLIC_MAIN_APP_URL="http://localhost:5173"`, and Supabase public keys.

### 2. Centralized Cross-App Redirection & URL Routing
- **New URL Config Module ([`src/config/urls.js`](file:///d:/Raj/compiledchat/src/config/urls.js))**:
  - Implemented `getChatAppUrl(path)` (points to `http://localhost:8081` by default or `VITE_CHAT_APP_URL`).
  - Implemented `getMainAppUrl(path)` (points to `http://localhost:5173` by default or `VITE_MAIN_APP_URL`).
  - Implemented `getBackendUrl(path)` (points to `http://localhost:4000` by default or `VITE_BACKEND_URL`).
- **New Chat Screen URL Config Module ([`chatscreen/src/config/urls.js`](file:///d:/Raj/compiledchat/chatscreen/src/config/urls.js))**:
  - Implemented `getMainAppUrl(path)` and `getBackendUrl(path)` for React Native Web navigation.

### 3. Redirection Updates (Replacing `nextarcher.com` with `localhost`)
- **Main Vite Web App**:
  - **[`src/App.jsx`](file:///d:/Raj/compiledchat/src/App.jsx)**: Updated `ChatRedirect` component to redirect via `getChatAppUrl()` to port `8081` instead of `https://chat.sai.nextarcher.com`.
  - **[`src/components/layout/GlobalNavbar.jsx`](file:///d:/Raj/compiledchat/src/components/layout/GlobalNavbar.jsx)**: Updated top navigation bar "Chat-SAI" link to redirect to local Chat Screen (`getChatAppUrl()`).
  - **[`src/pages/AuraScannerPage.jsx`](file:///d:/Raj/compiledchat/src/pages/AuraScannerPage.jsx)**: Updated "Proceed to Chat" redirect to local Chat Screen.
  - **[`src/pages/SuperchargePage.jsx`](file:///d:/Raj/compiledchat/src/pages/SuperchargePage.jsx)**: Updated "Start Supercharge" redirect to local Chat Screen.
  - **[`src/pages/ChatScreenPage.jsx`](file:///d:/Raj/compiledchat/src/pages/ChatScreenPage.jsx)**: Updated "↗ Open Direct" external button link to `getChatAppUrl()`.
  - **[`src/services/snapKitService.js`](file:///d:/Raj/compiledchat/src/services/snapKitService.js)**: Updated Snap Kit OAuth redirect URI fallback to `http://localhost:8081`.
  - **[`src/services/apiClient.js`](file:///d:/Raj/compiledchat/src/services/apiClient.js)**: Switched default API base from Railway to `http://localhost:4000/api`.
  - **[`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)**: Switched `TWIN_API_BASE` fallback to `http://localhost:4000/api/v1/twin`.
- **Chat Screen Expo App**:
  - **[`AIChatLightScreen.js`](file:///d:/Raj/compiledchat/chatscreen/src/screens/AIChatLightScreen.js) & [`AIChatDarkScreen.js`](file:///d:/Raj/compiledchat/chatscreen/src/screens/AIChatDarkScreen.js)**:
    - Replaced all session completion and registration redirects (`https://sai.nextarcher.com/register`) with `getMainAppUrl('/register')`.
    - Replaced all Soul Matrix redirects (`https://sai.nextarcher.com/soul-matrix`) with `getMainAppUrl('/soul-matrix')`.
    - Replaced all Twin Chat redirects (`https://sai.nextarcher.com/twin-chat`) with `getMainAppUrl('/twin-chat')`.
    - Replaced all Chakra Healing redirects (`https://sai.nextarcher.com/healing` and `/heal-me`) with `getMainAppUrl('/healing')` and `getMainAppUrl('/heal-me')`.
    - Replaced all Aura Scanner redirects (`https://sai.nextarcher.com/scan`) with `getMainAppUrl('/scan')`.
    - Replaced hardcoded Railway telemetry analysis calls (`https://compiledchat-production.up.railway.app/api/v1/chat/sai/analyze`) with `getBackendUrl('/api/v1/chat/sai/analyze')`.
  - **[`DesktopSidebar.js`](file:///d:/Raj/compiledchat/chatscreen/src/components/DesktopSidebar.js)**:
    - Updated profile click and "Chat-TWIN" button redirects to `getMainAppUrl('/soul-matrix')` and `getMainAppUrl('/twin-chat')`.
  - **[`saiApi.js`](file:///d:/Raj/compiledchat/chatscreen/src/utils/saiApi.js)**:
    - Updated `BACKEND_STREAM_URL` to `getBackendUrl('/api/v1/chat/sai/stream')`.
  - **[`storage.js`](file:///d:/Raj/compiledchat/chatscreen/src/utils/storage.js)**:
    - Updated `BACKEND_URL` fallback to `http://localhost:4000`.

### 4. Dependency Installation & Service Execution
- Installed all packages in `backend/`, root `compiledchat/`, and `chatscreen/`.
- Started:
  - **Node/Express Backend API**: Running on `http://localhost:4000`
  - **Main Frontend Vite App**: Running on `http://localhost:3000`
  - **AI Chat Screen Expo App**: Running on `http://localhost:8081`

---

## [Digital Twin Chat — Progress Bar, Tool Calling & Works Execution] - 2026-08-14

### 1. Live Agent Execution & Progress Pipeline
- **Glowing Multi-Stage Progress Bar**:
  - Implemented dynamic progress tracker transitioning through all stages of agent workflow (0% → 100%).
  - Integrated shimmer and glowing pulse styling with real-time millisecond elapsed timer (`⏱️ 04.3s`).
  - Added live milestone pipeline:
    1. `Prompt Ingestion & Context Mapping`
    2. `Agent Reasoning & Tool Selection`
    3. `Tool Invocation & Neural Execution`
    4. `Artifact Compilation & Output Generation`

### 2. Real-Time Tool Calling & Activity Visualization
- **Live Tool Calling Banner (`LiveProgressCard`)**:
  - Displays active tool badge with spinning gear/terminal icon, tool name (e.g. `python_workspace_sandbox`, `web_search`, `neural_reasoning_core`), execution status, and code/input snippet preview.
- **Collapsible Activity & Tool Logs Drawer**:
  - Added expandable terminal view displaying color-coded timestamped execution logs, tool invocation events, and internal agent reasoning thoughts.

### 3. Persistent Works Done Summary in Messages
- **`CompletedWorksSummary` Accordion**:
  - Delivered twin messages now embed an interactive `⚡ Works Done & Tools Invoked (N steps • X.Xs)` collapsible header.
  - Expanding the card reveals all tools invoked, step verification checkmarks, execution duration, and cycle count.

### 4. Backend SSE Event Streaming Route
- **[`backend/src/controllers/twinController.js`](file:///d:/Raj/compiledchat/backend/src/controllers/twinController.js) & [`twin.routes.js`](file:///d:/Raj/compiledchat/backend/src/routes/twin.routes.js)**:
  - Implemented `GET /api/v1/twin/runs/:runId/events` SSE streaming proxy to receive real-time tool events, thoughts, and progress directly from the upstream agent runner.

---

## [Chat History Persistence, Separation & Account Linking] - 2026-08-14

### 1. Dedicated History Separation (Twin Chat vs SAI Chat)
- **Session Type Partitioning**:
  - Twin Chat sessions are saved with `session_type = 'twin'` and query strictly `session_type = 'twin'`.
  - SAI / Spiritual Chat sessions are saved with `session_type = 'spiritual'` and query `session_type IN ('spiritual', 'sai', 'chat')`.
  - No cross-contamination between Digital Twin and SAI Spiritual chat histories.

### 2. Account-Linked Persistence & Refresh Protection
- **Fixed Session Wipe on Page Refresh**:
  - Removed accidental `localStorage.removeItem` invocations across [`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx), [`AIChatLightScreen.js`](file:///d:/Raj/compiledchat/chatscreen/src/screens/AIChatLightScreen.js), and [`AIChatDarkScreen.js`](file:///d:/Raj/compiledchat/chatscreen/src/screens/AIChatDarkScreen.js).
  - Authenticated user accounts (`@active_auth_session`, `@spiritual_register_user`, `user_profile`) are preserved across reloads and second logins.
- **Instant Dual-Layer Caching**:
  - Chat sessions and messages are cached per-account in `localStorage` (`@chat_sessions_${chatType}_${email}` and `@chat_session_msgs_${sessionId}`) for instant 0ms restoration upon page load or re-login.

### 3. Backend Supabase Service Key & Proxy Enhancements
- **RLS Bypass via Service Role Key**:
  - Configured [`backend/src/config/supabase.js`](file:///d:/Raj/compiledchat/backend/src/config/supabase.js) to utilize `SUPABASE_SERVICE_ROLE_KEY`, resolving PostgreSQL Row-Level Security errors on `chat_sessions` and `chat_messages`.
- **Enhanced Proxy Endpoints ([`backend/src/controllers/chatController.js`](file:///d:/Raj/compiledchat/backend/src/controllers/chatController.js))**:
  - `POST /api/v1/chat/sync-user`: Resolves or creates user records in `users` and `user_profiles` tables.
  - `POST /api/v1/chat/sync-session`: Automatically matches `user_id` by email if missing, guaranteeing message persistence.
  - `GET /api/v1/chat/sessions`: Supports filtering by `user_id`, `email`, and `session_type`.
  - `GET /api/v1/chat/sessions/:sessionId/messages-proxy`: Retrieves ordered conversation transcripts.

---

## [Long-Running Task Support & Browser Completion Alerts] - 2026-08-14

### 1. Pre-Execution Notification Permission System
- **Early Opt-In Request**:
  - Automatically checks `Notification.permission` upon task dispatch in [`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx).
  - Renders an interactive `.twin-notif-prompt-card` inside `LiveProgressCard` giving users single-click access to enable browser notifications (`🔔 Notify Me`).
  - Displays a green `.twin-notif-enabled-badge` when active, confirming users can safely switch tabs or minimize the browser during long runs.

### 2. Multi-Modal Completion Alerts
- **Native Web Desktop Notification**:
  - Triggers rich browser notification with task snippet, duration, and direct click-to-focus action when the model finishes.
- **Harmonic Audio Chime**:
  - Synthesizes a two-tone pleasant harmonic chime (E5 → A5 sine wave) via the native Web Audio API (`AudioContext`).
- **Dynamic Tab Title Flashing**:
  - Flashes `✨ (1) Task Complete!` on the browser tab if the tab is hidden/minimized until the user clicks back into focus.

### 3. Extended 8-Minute Execution Tolerance
- **Increased Polling Headroom**:
  - Expanded polling loop from 60 cycles (~1.8m) to **240 cycles with dynamic backoff (up to 8 minutes)**, easily accommodating deep reasoning, coding sandbox execution, and complex file generation (2–5+ mins).
- **Long-Running Guidance Banner**:
  - Automatically displays `.twin-long-task-notice` when tasks pass 45s explaining that deep multi-step execution is progressing in the background.

---

## [Clerk-Exclusive Authentication & Single-Execution Scan Lifecycle] - 2026-08-14

### 1. Clerk-Exclusive Authentication Flow
- **Removed Manual Email/Password Inputs**:
  - Completely purged manual email and password inputs, "OR CREDENTIALS" dividers, and direct credential login forms from [`AuraScannerPage.jsx`](file:///d:/Raj/compiledchat/src/pages/AuraScannerPage.jsx).
- **Removed Alternative Login & SMS Reset Modals**:
  - Deleted the entire "Alternative Sign In" modal (`showManualLoginModal`), manual profile loaders, and SMS OTP password reset flows.
  - Cleaned up manual fallback links from the camera permission modal.
- **Pure Clerk Integration**:
  - Authentication is strictly powered by Clerk (`SignInButton`, `SignUpButton`, and `UserButton`).
  - Seamlessly syncs authenticated Clerk identities to `@active_auth_session`, `@spiritual_register_user`, and Supabase `users` database table upon login.

### 2. Single-Execution Scan Lifecycle
- **Prevented Redundant & Looping Scans**:
  - Added single-execution tracking flags (`hasScannedRef`, `isScanningRef`) to ensure the neural sentiment/aura scan runs **strictly once** when the user logs in and camera permissions are granted.
  - Prevents the facial sentiment recognition loop from restarting again and again on re-renders or page navigation.
- **Manual Rescan Capability**:
  - Added a clean `[ 🔄 Rescan Aura ]` button within the biometric HUD frame if the user explicitly requests a new scan.

---

## [Twin Chat Full Markdown & Table Formatting Engine] - 2026-08-14

### 1. GitHub Flavored Markdown (GFM) Parser
- **Integrated `marked` Parser**:
  - Replaced ad-hoc regex string replacements with the `marked` GitHub Flavored Markdown engine in [`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx).
  - Automatically parses GFM tables, code blocks, task lists, blockquotes, ordered/unordered lists, and nested typography.

### 2. High-Performance Styled Table & Typography Rendering
- **Markdown Tables (`<table>`, `<th>`, `<td>`, `<tr>`)**:
  - Styled with glowing gradient headers (`#00e5ff`), dark translucent row backgrounds, subtle borders, zebra striping, and hover effects in [`DigitalTwinChatScreen.css`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.css).
- **Code Blocks & Syntax Snippets (`<pre>`, `<code>`)**:
  - Monospace font with cyan accent highlights, padded backgrounds, and clean border radius.
- **Typography & Headers**:
  - `h1`/`h2` rendered with glowing cyan highlights, `h3`/`h4` in soft purple, blockquotes with left accent borders, and lists with styled bullet markers.
- **Bubble Width Optimization**:
  - Expanded twin message bubbles to `max-width: 85%` so dense analytical tables and reports display naturally without clipping.

---

## [Restored `nextarcher.com` Production Redirections] - 2026-08-14

### 1. Centralized URL Configurations Updated
- **Main App URL Config ([`src/config/urls.js`](file:///d:/Raj/compiledchat/src/config/urls.js))**:
  - `getChatAppUrl()`: Restored default target to `https://chat.sai.nextarcher.com`.
  - `getMainAppUrl()`: Restored default target to `https://sai.nextarcher.com`.
- **Chat App URL Config ([`chatscreen/src/config/urls.js`](file:///d:/Raj/compiledchat/chatscreen/src/config/urls.js))**:
  - `getMainAppUrl()`: Restored default target to `https://sai.nextarcher.com`.

### 2. Environment Configurations Updated
- **[`compiledchat/.env`](file:///d:/Raj/compiledchat/.env)**:
  - Configured `VITE_CHAT_APP_URL="https://chat.sai.nextarcher.com"` and `VITE_MAIN_APP_URL="https://sai.nextarcher.com"`.
- **[`chatscreen/.env`](file:///d:/Raj/compiledchat/chatscreen/.env)**:
  - Configured `EXPO_PUBLIC_MAIN_APP_URL="https://sai.nextarcher.com"`.

---

## [Digital Twin JWT Authentication & `sub` Claim Compliance] - 2026-08-14

### 1. Client-Side JWT Generator Module
- **Created [`src/utils/twinJwt.js`](file:///d:/Raj/compiledchat/src/utils/twinJwt.js)**:
  - Implemented client-side HS256 JWT generation using the native Web Crypto API.
  - Formats JWT payload with mandatory claims:
    - `sub`: String user identifier (`user_${id}` / `user_${email}`).
    - `name`: User display name.
    - `exp`: Future expiration timestamp (30 days validity).
    - `iat`: Current epoch timestamp.
  - Signs payload using `TWIN_JWT_SECRET` (`"twin-local-test-secret-key-32-chars-long"`).

### 2. Frontend Authorization Header Integration
- **Updated [`src/pages/DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx)**:
  - Replaced plain username string headers with verified signed JWT tokens.
  - Sets strict `Authorization: Bearer <signed_jwt>` header across `POST /runs`, `GET /runs/:id`, `GET /runs/:id/events`, and file download endpoints.

### 3. Backend Proxy Token Verification & Re-signing Layer
- **Updated [`backend/src/controllers/twinController.js`](file:///d:/Raj/compiledchat/backend/src/controllers/twinController.js)**:
  - Added `getOrGenerateTwinJwt(req)` helper to inspect incoming Bearer tokens.
  - Ensures tokens sent to upstream FastAPI server (`http://65.2.37.177:8000`) always have a valid `sub` claim and matching HS256 secret signature.
  - Eliminates 401 Unauthorized errors on `/runs`.

---

## [Human-Readable JWT `sub` & Custom Audit Claims] - 2026-08-14

### 1. Human-Readable Subject (`sub`) Mapping
- **Replaced Raw UUIDs with Semantic Identifiers**:
  - Updated [`src/utils/twinJwt.js`](file:///d:/Raj/compiledchat/src/utils/twinJwt.js) and [`backend/src/controllers/twinController.js`](file:///d:/Raj/compiledchat/backend/src/controllers/twinController.js) to prioritize human-readable user identifiers (`user.email`, `user.preferred_username`, or `user.firstName`) for the `sub` claim instead of database UUIDs (e.g. `c6abe8b0-8e0b-4501-8d7a-42bac2a147b1`).
- **Enriched Custom Claims for Multi-Tenant Audit Logs**:
  - `sub`: `user@nextarcher.com` / `user_alex`
  - `name`: User full or first name (e.g. `Alex` or `Anish Maurya`)
  - `preferred_username`: Preferred display name / username
  - `email`: Authenticated user email
  - `user_id`: Underlying database UUID for relational mapping
- **Header Protocol Maintained**:
  - Dispatches strictly formatted `Authorization: Bearer <signed_jwt>` header across all client and backend proxy requests.

---

## [Proactive Notification Permission & Extended 2–5+ Min Task System] - 2026-08-14

### 1. Pre-Flight Notification Permission Request (At First)
- **Top Proactive Alert Banner**:
  - Added `.twin-top-notif-banner` in [`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx) prompting users right upon entering the chat with single-click desktop notification activation.
- **Immediate First-Action Permission Prompt**:
  - Automatically triggers `Notification.requestPermission()` at the very first instant a user dispatches a message in `handleSend`.

### 2. Extended Execution Guidance (>2–5 Minutes)
- **2–5 Minute Dedicated Alert Card**:
  - When a task exceeds 120s (2 mins), `LiveProgressCard` renders `.twin-extended-task-notice` informing the user that deep multi-step synthesis, code execution, and document compilation take 2–5+ minutes.
  - Confirms users can minimize or switch tabs freely, offering a direct notification opt-in button if permission was not yet enabled.

### 3. Multi-Modal Task Completion Alerts
- **Desktop Notification**: Dispatches rich persistent desktop notification (`requireInteraction: true`) with task summary, execution duration, and click-to-focus action only after permission is explicitly granted.
- **Harmonic Audio Chime**: Synthesizes a two-tone pleasant harmonic chime via Web Audio API.
- **Tab Title Flashing**: Flashes `✨ (1) Task Complete!` until the user switches back into focus.

---

## [Interactive Notification Permission Modal & Opt-in Flow] - 2026-08-14

### 1. Interactive Permission Request Modal (At First)
- **First-Visit Permission Dialog**:
  - Implemented `<Modal isOpen={showNotifModal}>` in [`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx) prompting the user upfront with a clear explanation that deep Twin tasks take 2–5+ minutes.
  - Gives the user full control with `[ Enable Notifications ]` and `[ Maybe Later ]` actions.
  - Persists preference in `localStorage` under `@twin_notif_modal_prompted` to avoid repeated popups.
- **Strict Permission Gating**:
  - Desktop notifications are only presented if the user has explicitly granted permission via the browser prompt.

---

## [Session Continuity & Global Vector Memory Alignment] - 2026-08-14

### 1. Same-Chat `session_id` Reuse
- **Short-Term Context Continuity**:
  - Maintained `currentSessionId` state across all messages within the active thread.
  - Reuses the active `session_id` in all `POST /runs` requests so the backend model retains immediate multi-turn conversational context.
  - Session history and generated artifacts are saved under `currentSessionId` in local storage and backend sync.

### 2. Global Vector Memory Integration
- **Cross-Session Recall**:
  - Clicking `[ + New Chat ]` spins up a clean `session_id` UUID for a fresh conversation thread.
  - The backend's Vector Memory engine (`SaveMemory` & `SearchMemory`) continues to store and recall user facts, profile details, and preferences globally across sessions.

---

## [State Lag Fix & Precise Per-Run File Matching] - 2026-08-14

### 1. Eliminated 1-Step UI State Lag
- **Functional State Updaters**:
  - Refactored `handleSend` in [`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx) to eliminate stale closures.
  - Added user message immediately with functional setter `setMessages(prev => [...prev, newMsg])`.
  - Appends the completed AI response directly to the latest state upon run completion, preventing stale message overrides.
- **Extended Polling Duration & Input Guard**:
  - Extended polling loop to 300 cycles (up to 10 minutes) so deep research & document generation tasks (120–160s) complete reliably without dropping the polling connection.
  - Disabled input and added dedicated visual submit button with spinning state during active runs to prevent race conditions.

### 2. Precise Per-Run File Correlation
- **Snapshot Diffing**:
  - Snapshots existing session file names before initiating a new run.
  - When the backend returns the historical `files` array for the session, filters out script artifacts (`.py`, `.sh`, `.bat`, `.tmp`) and compares against the pre-run snapshot to isolate **only the files created in that specific run**.
  - Includes intelligent text-mention fallback to ensure each message bubble displays exclusively the exact file intended for that prompt.

---

## [Backend URL Sanitization & Document Presentation] - 2026-08-14

### 1. Stripped Backend URLs from AI Responses
- **Integrated `cleanTwinOutputText` ([`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx))**:
  - Replaced raw backend server endpoints (e.g. `http://65.2.37.177:8000/sessions/.../files/...` and `/sessions/.../files/...`) with clean, bold document names (e.g. `**Apple_Shares_Detailed_Report.pdf**`).
  - Stripped internal server origins (`http://65.2.37.177:8000`, `http://localhost:4000/api/v1/twin`).
  - Integrated into both `renderMarkdown` and the run completion handler before message storage.

### 2. Direct Document Card Presentation
- **Clean Interactive Document Cards**:
  - Rendered files directly through `.file-download-card` components attached beneath the AI message bubble with file icon, name, file size, and direct secure blob download.
  - Eliminates exposed backend links or file paths from the chat text.

---

## [Direct Blob Download & Token Query Auth Fix] - 2026-08-14

### 1. Eliminated Raw API Error Tabs on File Download
- **In-Memory Blob Download Stream ([`DigitalTwinChatScreen.jsx`](file:///d:/Raj/compiledchat/src/pages/DigitalTwinChatScreen.jsx))**:
  - Replaced unauthenticated `window.open(url, '_blank')` fallback with direct client-side blob streaming via authenticated `fetch(url, { headers: { 'Authorization': 'Bearer ...' } })`.
  - Added dynamic loading indicator (`<Loader2 className="spinner-icon" />`) on file download cards during active transfer.
  - Automatically triggers silent browser file save (`a.download`) without navigating or opening error JSON tabs.

### 2. Supported Token Query Parameter in Backend
- **Query Parameter Auth Support ([`twinController.js`](file:///d:/Raj/compiledchat/backend/src/controllers/twinController.js))**:
  - Enhanced `getOrGenerateTwinJwt` to accept `req.query.token` in addition to `req.headers.authorization`.
  - Guarantees valid authentication even if download URLs are opened in new browser windows.

---

## [UI Terminology Update: Platform Karma Rating] - 2026-08-14

### 1. Updated Metric Headers
- **Top Overview Card**: Retained **"Current Life Score"** (showing `74 / 100`) in [`SoulMatrixPage.jsx`](file:///d:/Raj/compiledchat/src/pages/SoulMatrixPage.jsx).
- **Bottom Real-Time Metrics Widget**: Set to **"Platform Karma Rating"** (Truth / Consciousness / Energy) in [`DashboardMetrics.jsx`](file:///d:/Raj/compiledchat/src/components/features/anish/DashboardMetrics.jsx).
















