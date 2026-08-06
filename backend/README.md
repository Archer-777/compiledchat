# Next Archer — Production Backend Deployment Guide

This repository contains the standalone production backend API server for **Next Archer** and the **AI Chat Screen**.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL FRONTENDS                         │
│                                                             │
│ 1. Next Archer Web App     ──► https://nextarcher.vercel.app │
│ 2. AI Chat Screen App      ──► https://nextarcher-chat.vercel.app
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │  REST API & Shared JWT       │
               │  HttpOnly Cookies            │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRODUCTION BACKEND SERVER                   │
│         (Hosted on Render / Railway / AWS / VPS)            │
│         URL: https://nextarcher-backend.onrender.com        │
│                                                             │
│  • Express.js Node API (Port 4000)                          │
│  • Configured CORS allowing Vercel deployed origins         │
│  • JWT Authentication in HttpOnly Shared Cookie              │
│  • Grok AI Engine (gsk_MrQrZAELEUDbl6FF6iJDWGdyb3FY...)     │
│  • Fast2SMS SMS Gateway                                     │
│  • Supabase Production Database Persistence                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Environment Variables for Vercel Frontends

When deploying both frontend projects on **Vercel**, set the following environment variables in their respective Vercel project dashboards:

### Frontend 1: Next Archer Main Web App (`https://nextarcher.vercel.app`)
```bash
VITE_BACKEND_URL=https://nextarcher-backend.onrender.com
VITE_SUPABASE_URL=https://qwmnyomlfchazapkohfy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_C0TgaPZQ0Y88i1oJkx9HTA_VqtDnJUv
```

### Frontend 2: AI Chat Screen App (`https://nextarcher-chat.vercel.app`)
```bash
EXPO_PUBLIC_BACKEND_URL=https://nextarcher-backend.onrender.com
EXPO_PUBLIC_SUPABASE_URL=https://qwmnyomlfchazapkohfy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_C0TgaPZQ0Y88i1oJkx9HTA_VqtDnJUv
```

---

## 🔒 Security & Cross-Site Authentication

1. **HttpOnly Shared Cookie (`authToken`)**:
   * The backend issues a JWT token set inside a secure `HttpOnly` cookie with `SameSite=None; Secure`.
   * This allows user sessions to persist across both Vercel frontend domains seamlessly and securely.

2. **Configured CORS**:
   * The backend `cors.js` restricts requests to verified origins:
     `https://nextarcher.vercel.app`, `https://nextarcher-chat.vercel.app`, `http://localhost:3000`, `http://localhost:8081`.

---

## ⚡ Grok AI Engine & Services Integration

* **Grok AI API**: Uses `GROK_API_KEY` for real-time AI conversation completions.
* **Fast2SMS**: Uses Fast2SMS API Key `pjgNOCe9TSqQ5zwbIBsZFdkXaYGPVcuMyf2KR438niWvm1rDU0xjI24yBTlCuPVzeiOGwK1h9rQFApb7` for direct SMS OTP delivery (`route: 'q'`).
* **Supabase Database**: Uses Supabase URL `https://qwmnyomlfchazapkohfy.supabase.co` for `user_profiles` and `chat_messages` persistence.

---

## 🚀 Running the Backend Locally

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The backend server starts on **`http://localhost:4000`**. Health check URL: `http://localhost:4000/health`.
