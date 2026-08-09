# 📋 Developer Handover & Technical Context Documentation

This document provides complete technical context, system architecture overview, recent updates, and exact root-cause bugs to be resolved by the developer.

---

## 1. System Overview & Data Flow

The application consists of the **Spiritual AI Chat (SAI)** companion and the **Soul Matrix Dashboard (`/soul-matrix`)**.

```
[ User Chat Session ] ──(End Session / Instant Trigger)──> [ Backend LLM Engine ]
                                                                   │
                                                                   ▼
[ Soul Matrix UI Dashboard ] <──(GET /telemetry / DB)─── [ Supabase DB & Memory ]
```

### Key Components & Metrics
When a user ends a session or requests analysis, the AI telemetry engine (`aicredits.in / Groq`) analyzes the conversation and derives the following structured metrics:
1. **Maslow Matrix Pyramid**:
   - `physiological`, `safety`, `belonging_love` (`love_belonging`), `esteem`, `cognitive`, `aesthetic`, `self_actualization`, `transcendence`
2. **Chakra Balance**:
   - Scores for Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown + `weak_chakras` array.
3. **Growth & Consciousness**:
   - `collective_intelligence_index` / `collective_intelligence`
   - `global_consciousness_score` / `global_consciousness`
   - `balanced_thinking_ratio` / `balanced_thinking`
4. **My World Balance**:
   - `business`, `family`, `friend`
5. **Karma Rating**:
   - Derived overall score (`energy.score`)

---

## 2. Summary of All Fixes Applied (Code Changes Done ✅)

### ✅ Fix #1: `isSupabaseConfigured` was Undefined in Backend
- **Root Cause**: `isSupabaseConfigured` was used in `chatController.js` (lines ~410 & ~614) but **never imported or defined**. It was always `undefined` (falsy), so ALL Supabase DB reads/writes were silently skipped.
- **Files Changed**:
  - [`backend/src/config/supabase.js`](file:///d:/Ansd/backend/src/config/supabase.js) — Added `isSupabaseConfigured` boolean and exported it.
  - [`backend/src/controllers/chatController.js`](file:///d:/Ansd/backend/src/controllers/chatController.js) — Added `const { isSupabaseConfigured } = require('../config/supabase');` import.

### ✅ Fix #2: End Session Was Sending Dummy Text Instead of Real Chat
- **Root Cause**: "End Session & Soul Matrix ✨" button hardcoded `messages: [{ sender: 'user', text: 'End Session analysis request' }]` — a static 45-character string. The AI always analyzed that same dummy text.
- **File Changed**: [`src/pages/ChatScreenPage.jsx`](file:///d:/Ansd/src/pages/ChatScreenPage.jsx)
- **What Changed**: Now reads the actual conversation from `localStorage('@spiritual_chat_sessions')`, extracts the latest session's messages array, and also passes the user's email to the analyze endpoint.

### ✅ Fix #3: `getLatestTelemetry` Had Hardcoded Maslow Scores
- **Root Cause**: When reading from DB, the Maslow scores were hardcoded (`78, 72, 68...`) instead of using the `data` row values.
- **File Changed**: [`backend/src/controllers/chatController.js`](file:///d:/Ansd/backend/src/controllers/chatController.js)
- **What Changed**: Now checks for a `telemetry_json` column first (returns full blob), then falls back to individual DB columns using `data.maslow_physiological || 78` pattern.

### ✅ Fix #4: Full Telemetry JSON Blob Now Saved to DB
- **File Changed**: [`backend/src/controllers/chatController.js`](file:///d:/Ansd/backend/src/controllers/chatController.js)
- **What Changed**: `analyzeSession` now also saves `telemetry_json: parsedTelemetry` and `balanced_thinking` to the DB upsert call, preserving the complete analysis output.

---

## 3. 🚨 Remaining Action Required (DB Migration)

### 🔴 ACTION: Run Supabase SQL Migration
- **File**: [`backend/migration_add_telemetry_columns.sql`](file:///d:/Ansd/backend/migration_add_telemetry_columns.sql)
- **Why**: The `user_profiles` is a **VIEW** (not a table) over `public.users`. The `users` table currently lacks the telemetry columns (`karma_rating`, `my_world_business`, `collective_intelligence`, `telemetry_json`, etc.). Without these columns, the DB upsert will fail.
- **How to Run**:
  1. Open Supabase Dashboard → SQL Editor → New Query
  2. Paste the contents of `migration_add_telemetry_columns.sql`
  3. Execute
- **What It Does**:
  - Adds telemetry columns to `public.users` table: `karma_rating`, `my_world_business`, `my_world_family`, `my_world_friend`, `collective_intelligence`, `global_consciousness`, `balanced_thinking`, `weak_chakras`, `telemetry_json`
  - Recreates the `user_profiles` VIEW to include these new columns

> [!IMPORTANT]
> Without running this migration, the backend will throw errors when trying to save/read telemetry to/from the database.

---

## 📁 Key File Map

| Component / Layer | Primary Files |
| :--- | :--- |
| **Frontend Pages** | [`ChatScreenPage.jsx`](file:///d:/Ansd/src/pages/ChatScreenPage.jsx), [`SoulMatrixPage.jsx`](file:///d:/Ansd/src/pages/SoulMatrixPage.jsx) |
| **Frontend Visuals** | [`MaslowPyramid.jsx`](file:///d:/Ansd/src/components/visuals/MaslowPyramid.jsx), [`ChakraFigure.jsx`](file:///d:/Ansd/src/components/visuals/ChakraFigure.jsx), [`DashboardMetrics.jsx`](file:///d:/Ansd/src/components/features/anish/DashboardMetrics.jsx) |
| **Storage Utilities** | [`storage.js`](file:///d:/Ansd/src/utils/storage.js), [`apiClient.js`](file:///d:/Ansd/src/services/apiClient.js) |
| **Data Defaults** | [`soulMatrixData.js`](file:///d:/Ansd/src/data/soulMatrixData.js) |
| **Backend Controllers** | [`chatController.js`](file:///d:/Ansd/backend/src/controllers/chatController.js) |
| **Backend Config** | [`supabase.js`](file:///d:/Ansd/backend/src/config/supabase.js), [`chat.routes.js`](file:///d:/Ansd/backend/src/routes/chat.routes.js) |
| **DB Migration** | [`migration_add_telemetry_columns.sql`](file:///d:/Ansd/backend/migration_add_telemetry_columns.sql) |

---

## 🔄 API Endpoints Reference

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/chat/sai/analyze` | Sends conversation messages to LLM, gets telemetry analysis, saves to DB |
| `GET` | `/api/v1/chat/sai/telemetry?email=...` | Reads latest telemetry from DB for a user |
| `POST` | `/api/v1/chat/sai/stream` | SSE streaming chat endpoint |
