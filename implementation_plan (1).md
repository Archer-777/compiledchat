# Next Archer — Complete Backend Architecture Document

> **Version**: 1.0  
> **Date**: 2026-08-06  
> **Status**: Architecture Blueprint — Ready for Implementation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema (PostgreSQL)](#5-database-schema-postgresql)
6. [Authentication System](#6-authentication-system)
7. [API Endpoints (Full Reference)](#7-api-endpoints-full-reference)
8. [AI Chat Engine](#8-ai-chat-engine)
9. [Redis Caching Architecture](#9-redis-caching-architecture)
10. [Cross-Device Sync](#10-cross-device-sync)
11. [Load Balancing & Scaling](#11-load-balancing--scaling)
12. [Rate Limiting](#12-rate-limiting)
13. [WebSocket / Real-Time Layer](#13-websocket--real-time-layer)
14. [Docker Compose Setup](#14-docker-compose-setup)
15. [NGINX Configuration](#15-nginx-configuration)
16. [Deployment Guide](#16-deployment-guide)
17. [Security Checklist](#17-security-checklist)
18. [Frontend Integration Changes](#18-frontend-integration-changes)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET (HTTPS)                             │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                               │
│              SSL Termination · Gzip · Rate Limit                     │
│              Static File Serving (React build)                       │
└───────┬──────────────┬──────────────┬────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│  Node.js #1  ││  Node.js #2  ││  Node.js #3  │   ← Stateless API Servers
│  Express.js  ││  Express.js  ││  Express.js  │      (Round-Robin LB)
│  Socket.io   ││  Socket.io   ││  Socket.io   │
└──────┬───────┘└──────┬───────┘└──────┬───────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐    ┌─────────────────────────┐
│   Redis 7        │    │  Supabase PostgreSQL     │
│   (Upstash)      │    │  + pgvector extension    │
│                  │    │  + Storage CDN            │
│ • Sessions       │    │                           │
│ • AI Cache       │    │ • user_profiles           │
│ • Rate Limits    │    │ • user_auras (128-D)      │
│ • OTP Store      │    │ • chat_conversations      │
│ • Chat Context   │    │ • chat_messages           │
└──────────────────┘    │ • user_sessions           │
                        │ • micro_tasks             │
                        │ • aura_scans (bucket)     │
                        └─────────────────────────┘

          ┌─────────────────────────────────────┐
          │         EXTERNAL SERVICES            │
          │                                      │
          │  • OpenAI GPT-4o  (AI Chat Primary)  │
          │  • Google Gemini  (AI Chat Fallback)  │
          │  • Fast2SMS       (Phone OTP)         │
          │  • Resend         (Email OTP)         │
          └──────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20 LTS | Server-side JavaScript |
| **Framework** | Express.js | 4.x | REST API routing, middleware |
| **Real-time** | Socket.io | 4.x | WebSocket for live chat streaming |
| **Database** | Supabase PostgreSQL | 15+ | Primary data store (existing) |
| **Vector Search** | pgvector | 0.5+ | 128-D face embedding similarity (existing) |
| **Cache** | Redis 7 | 7.x | Sessions, caching, rate limiting, OTP |
| **Auth** | jsonwebtoken + bcryptjs | Latest | JWT tokens + password hashing |
| **AI Primary** | OpenAI SDK | 4.x | GPT-4o / GPT-4o-mini chat completions |
| **AI Fallback** | Google Generative AI SDK | Latest | Gemini 2.5 Flash / Pro |
| **Email** | Resend SDK | Latest | Transactional email (OTP, password reset) |
| **SMS** | Fast2SMS HTTP API | v3 | Phone OTP delivery |
| **Validation** | Joi | 17.x | Request body/param validation |
| **Logging** | Winston | 3.x | Structured JSON logging |
| **Process Mgr** | PM2 | 5.x | Multi-instance clustering, auto-restart |
| **Containerization** | Docker + Docker Compose | Latest | Local dev + deployment |
| **Load Balancer** | NGINX | 1.25+ | Reverse proxy, SSL, round-robin |

---

## 3. Directory Structure

```
server/
├── .env                              # All secrets (NEVER committed to git)
├── .env.example                      # Template with placeholder values
├── .gitignore
├── package.json
├── Dockerfile
├── docker-compose.yml
├── nginx/
│   └── nginx.conf                    # NGINX reverse proxy configuration
│
├── src/
│   ├── index.js                      # App entry point — Express bootstrap
│   │
│   ├── config/
│   │   ├── database.js               # Supabase client initialization
│   │   ├── redis.js                  # Redis (Upstash/local) connection
│   │   ├── ai.js                     # OpenAI + Gemini SDK initialization
│   │   └── constants.js              # App-wide constants (TTLs, limits)
│   │
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification + user injection
│   │   ├── rateLimiter.js            # Redis sliding-window rate limiter
│   │   ├── validator.js              # Joi schema validation middleware
│   │   ├── errorHandler.js           # Global error handler (500s, 4xxs)
│   │   └── logger.js                 # Request/response logging (Winston)
│   │
│   ├── routes/
│   │   ├── index.js                  # Route aggregator
│   │   ├── auth.routes.js            # POST /api/auth/*
│   │   ├── chat.routes.js            # /api/chat/*
│   │   ├── user.routes.js            # /api/user/*
│   │   ├── aura.routes.js            # /api/aura/*
│   │   └── otp.routes.js             # /api/otp/*
│   │
│   ├── controllers/
│   │   ├── authController.js         # Register, login, refresh, logout
│   │   ├── chatController.js         # Conversations CRUD, message send
│   │   ├── userController.js         # Profile CRUD, device management
│   │   ├── auraController.js         # Scan upload, match, fetch
│   │   └── otpController.js          # Send OTP, verify OTP
│   │
│   ├── services/
│   │   ├── authService.js            # Password hashing, JWT creation
│   │   ├── chatService.js            # AI prompt building, context mgmt
│   │   ├── aiRouter.js               # OpenAI ↔ Gemini failover router
│   │   ├── cacheService.js           # Redis get/set/invalidate helpers
│   │   ├── otpService.js             # Fast2SMS + Resend server-side calls
│   │   └── profileService.js         # User profile business logic
│   │
│   ├── models/
│   │   ├── userModel.js              # user_profiles queries
│   │   ├── chatModel.js              # chat_conversations + chat_messages queries
│   │   ├── auraModel.js              # user_auras queries + pgvector RPC
│   │   ├── sessionModel.js           # user_sessions queries
│   │   └── taskModel.js              # micro_tasks queries
│   │
│   ├── validators/
│   │   ├── authSchemas.js            # Joi schemas for auth endpoints
│   │   ├── chatSchemas.js            # Joi schemas for chat endpoints
│   │   ├── userSchemas.js            # Joi schemas for user endpoints
│   │   └── auraSchemas.js            # Joi schemas for aura endpoints
│   │
│   ├── utils/
│   │   ├── tokenUtils.js             # JWT sign, verify, decode helpers
│   │   ├── hashUtils.js              # bcrypt hash + compare
│   │   ├── responseUtils.js          # Standardized API response builders
│   │   └── tokenCounter.js           # Approximate token counting for AI
│   │
│   └── socket/
│       ├── socketManager.js          # Socket.io initialization + auth
│       └── chatSocket.js             # Real-time chat event handlers
│
├── scripts/
│   ├── migrate.sql                   # Full database migration script
│   ├── seed.js                       # Seed data for development
│   └── hashPasswords.js              # One-time migration: plaintext → bcrypt
│
└── tests/
    ├── auth.test.js
    ├── chat.test.js
    └── aura.test.js
```

---

## 4. Environment Variables

```bash
# ═══════════════════════════════════════════
# server/.env
# ═══════════════════════════════════════════

# ── Server ──
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.nextarcher.com

# ── Supabase (existing project) ──
SUPABASE_URL=https://qwmnyomlfchazapkohfy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_C0TgaPZQ0Y88i1oJkx9HTA_VqtDnJUv
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>   # REQUIRED for server-side DB writes

# ── Redis ──
REDIS_URL=redis://default:<password>@<host>:<port>
# If using Upstash:
# REDIS_URL=rediss://default:<password>@<region>.upstash.io:6379

# ── JWT ──
JWT_ACCESS_SECRET=<random-64-char-hex-string>
JWT_REFRESH_SECRET=<different-random-64-char-hex-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# ── AI Providers ──
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_FALLBACK_MODEL=gpt-4o-mini

GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash

AI_PRIMARY_PROVIDER=openai          # "openai" or "gemini"
AI_MAX_CONTEXT_MESSAGES=20
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7

# ── OTP Services ──
FAST2SMS_API_KEY=pjgNOCe9TSqQ5zwbIBsZFdkXaYGPVcuMyf2KR438niWvm1rDU0xjI24yBTlCuPVzeiOGwK1h9rQFApb7
RESEND_API_KEY=re_...
OTP_FROM_EMAIL=security@nextarcher.com

# ── Rate Limiting ──
RATE_LIMIT_LOGIN=5/60s
RATE_LIMIT_OTP=3/300s
RATE_LIMIT_CHAT=30/60s
RATE_LIMIT_SCAN=10/60s

# ── CORS ──
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://nextarcher.com
```

---

## 5. Database Schema (PostgreSQL)

> Run this in Supabase SQL Editor: **Dashboard → SQL Editor → New Query**

```sql
-- ═══════════════════════════════════════════════════════════════════
-- NEXT ARCHER — COMPLETE PRODUCTION DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Extensions ──
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ═══════════════════════════════════════════════════════════════════
-- 2. USER PROFILES (existing — with migrations)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    age INT,
    gender TEXT,
    profession TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,                      -- Legacy plaintext (will be migrated)
    password_hash TEXT,                -- bcrypt hash (new — backend uses this)
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    avatar_url TEXT,                   -- Profile picture CDN URL
    digital_twin_unlocked BOOLEAN DEFAULT false,
    platform TEXT DEFAULT 'registration',
    preferences JSONB DEFAULT '{}',   -- { theme, language, notifications }
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Migration: Add new columns if table exists
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS digital_twin_unlocked BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);

-- ═══════════════════════════════════════════════════════════════════
-- 3. USER AURAS (existing — unchanged)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_auras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    image_data TEXT,
    signature JSONB,
    embedding vector(128),
    frequency TEXT DEFAULT '432Hz - 963Hz',
    resonance_score NUMERIC DEFAULT 98.4,
    aura_archetype TEXT,              -- NEW: 'gold', 'violet', 'indigo', etc.
    dominant_emotion TEXT,            -- NEW: 'happy', 'calm', 'surprised', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_auras ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_auras ADD COLUMN IF NOT EXISTS aura_archetype TEXT;
ALTER TABLE public.user_auras ADD COLUMN IF NOT EXISTS dominant_emotion TEXT;

CREATE INDEX IF NOT EXISTS user_auras_embedding_hnsw
ON public.user_auras USING hnsw (embedding vector_l2_ops);

CREATE INDEX IF NOT EXISTS idx_user_auras_user ON public.user_auras(user_id, created_at DESC);

-- pgvector RPC (existing — unchanged)
CREATE OR REPLACE FUNCTION match_aura_scan(
    query_embedding vector(128),
    match_threshold float DEFAULT 0.6,
    match_count int DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    image_url TEXT,
    image_data TEXT,
    signature JSONB,
    frequency TEXT,
    resonance_score NUMERIC,
    distance float
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT ua.id, ua.image_url, ua.image_data, ua.signature,
           ua.frequency, ua.resonance_score,
           (ua.embedding <-> query_embedding)::float AS distance
    FROM public.user_auras ua
    WHERE ua.embedding IS NOT NULL
      AND (ua.embedding <-> query_embedding) < match_threshold
    ORDER BY ua.embedding <-> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 4. CHAT CONVERSATIONS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    context_summary TEXT,             -- AI-generated rolling summary
    message_count INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conv_user
ON public.chat_conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conv_active
ON public.chat_conversations(user_id, is_archived, updated_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- 5. CHAT MESSAGES
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    model TEXT DEFAULT 'gpt-4o',
    metadata JSONB DEFAULT '{}',      -- { emotion, chakra_context, aura_theme }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_msg_conv
ON public.chat_messages(conversation_id, created_at ASC);

-- Function to auto-update conversation message_count
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_conversations
    SET message_count = message_count + 1,
        total_tokens = total_tokens + COALESCE(NEW.tokens_used, 0),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conv_stats ON public.chat_messages;
CREATE TRIGGER trg_update_conv_stats
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- ═══════════════════════════════════════════════════════════════════
-- 6. USER SESSIONS (JWT Refresh Token Tracking)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL UNIQUE,   -- bcrypt hash of refresh token
    device_info JSONB DEFAULT '{}',            -- { browser, os, ip, device_name }
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON public.user_sessions(expires_at);

-- Auto-cleanup expired sessions (run daily via pg_cron or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- 7. CHAT FEEDBACK (optional — for AI quality improvement)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),    -- 1-5 star rating
    feedback_type TEXT CHECK (feedback_type IN ('helpful', 'unhelpful', 'harmful', 'wrong')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- 8. MICRO TASKS (existing — unchanged)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    reward_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- 9. STORAGE BUCKET (existing — unchanged)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('aura_scans', 'aura_scans', true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;

-- Service-role policies (backend uses service_role key — full access)
-- These allow the Node.js backend to perform all operations
CREATE POLICY "service_role_all_user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_user_auras" ON public.user_auras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_chat_conversations" ON public.chat_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_user_sessions" ON public.user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_micro_tasks" ON public.micro_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_chat_feedback" ON public.chat_feedback FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public_aura_scans_storage" ON storage.objects FOR ALL
USING (bucket_id = 'aura_scans') WITH CHECK (bucket_id = 'aura_scans');
```

---

## 6. Authentication System

### 6.1 Token Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN PAIR SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACCESS TOKEN (Short-lived)          REFRESH TOKEN (Long-lived)  │
│  ─────────────────────────           ──────────────────────────  │
│  • Lifespan: 15 minutes             • Lifespan: 30 days         │
│  • Stored: Memory (JS variable)     • Stored: httpOnly cookie   │
│  • Contains: userId, email, name    • Contains: sessionId        │
│  • Used for: API authorization      • Used for: Getting new      │
│  • Sent via: Authorization header     access tokens              │
│                                      • Hash stored in DB         │
│                                        (user_sessions table)     │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Auth Flows

#### Registration Flow
```
Client                          Server                         Database          Redis
  │                                │                              │                │
  │── POST /api/auth/register ────►│                              │                │
  │   { firstName, lastName,       │                              │                │
  │     email, phone, password }   │                              │                │
  │                                │── Validate inputs ──►        │                │
  │                                │── bcrypt.hash(password) ──►  │                │
  │                                │── INSERT user_profiles ─────►│                │
  │                                │◄── user record ──────────────│                │
  │                                │── Generate JWT pair          │                │
  │                                │── hash(refreshToken) ───────►│ user_sessions  │
  │                                │── SET session:{userId} ─────────────────────►│
  │◄── 201 { accessToken,         │                              │                │
  │     user, refreshToken(cookie)}│                              │                │
```

#### Login Flow
```
Client                          Server                         Database          Redis
  │                                │                              │                │
  │── POST /api/auth/login ───────►│                              │                │
  │   { email, password,           │                              │                │
  │     deviceInfo }               │                              │                │
  │                                │── SELECT user WHERE email ──►│                │
  │                                │◄── user record ──────────────│                │
  │                                │── bcrypt.compare() ──►       │                │
  │                                │── Generate JWT pair          │                │
  │                                │── INSERT user_sessions ─────►│                │
  │                                │── SET session:{userId} ─────────────────────►│
  │                                │── UPDATE last_login_at ─────►│                │
  │◄── 200 { accessToken, user }   │                              │                │
```

#### Token Refresh Flow
```
Client                          Server                         Database          Redis
  │                                │                              │                │
  │── POST /api/auth/refresh ─────►│                              │                │
  │   Cookie: refreshToken         │                              │                │
  │                                │── Decode refresh JWT         │                │
  │                                │── hash(refreshToken)         │                │
  │                                │── SELECT session WHERE       │                │
  │                                │   refresh_token_hash ───────►│                │
  │                                │◄── session record ───────────│                │
  │                                │── Check: is_active &&        │                │
  │                                │   expires_at > NOW()         │                │
  │                                │── Generate new access token  │                │
  │                                │── UPDATE last_used_at ──────►│                │
  │                                │── Refresh Redis session ────────────────────►│
  │◄── 200 { accessToken }         │                              │                │
```

### 6.3 Auth Middleware (Pseudocode)

```javascript
// middleware/auth.js

async function authMiddleware(req, res, next) {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = authHeader.split(' ')[1];

  // 2. Verify JWT signature + expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 3. Check Redis session cache (< 1ms)
  let session = await redis.get(`session:${decoded.userId}`);
  if (!session) {
    // Cache miss → fetch from DB → write to Redis
    const user = await db.from('user_profiles').select('*').eq('id', decoded.userId).single();
    if (!user.data) return res.status(401).json({ error: 'User not found' });

    session = JSON.stringify(user.data);
    await redis.setex(`session:${decoded.userId}`, 1800, session); // 30 min TTL
  }

  // 4. Attach user to request
  req.user = JSON.parse(session);
  req.userId = decoded.userId;
  next();
}
```

---

## 7. API Endpoints (Full Reference)

### 7.1 Authentication — `/api/auth`

#### `POST /api/auth/register`
```
Headers: Content-Type: application/json
Body: {
  "firstName": "Raj",
  "lastName": "Mane",
  "email": "raj@example.com",
  "phone": "9876543210",
  "password": "securePass123",
  "age": 25,
  "gender": "male",
  "profession": "Developer"
}

Response 201: {
  "success": true,
  "user": {
    "id": "uuid-...",
    "firstName": "Raj",
    "lastName": "Mane",
    "email": "raj@example.com",
    "phone": "9876543210",
    "digitalTwinUnlocked": false
  },
  "accessToken": "eyJhbG...",
  "expiresIn": 900
}
+ Set-Cookie: refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

#### `POST /api/auth/login`
```
Body: {
  "email": "raj@example.com",        // or "phone": "9876543210"
  "password": "securePass123",
  "deviceInfo": {                     // optional — for device tracking
    "browser": "Chrome 125",
    "os": "Windows 11",
    "deviceName": "Raj's Laptop"
  }
}

Response 200: {
  "success": true,
  "user": { ... },
  "accessToken": "eyJhbG...",
  "expiresIn": 900
}
```

#### `POST /api/auth/refresh`
```
Headers: Cookie: refreshToken=eyJhbG...

Response 200: {
  "accessToken": "eyJhbG...(new)...",
  "expiresIn": 900
}
```

#### `POST /api/auth/logout`
```
Headers: Authorization: Bearer <accessToken>
         Cookie: refreshToken=eyJhbG...

Response 200: { "success": true, "message": "Logged out" }
+ Clear-Cookie: refreshToken
```

#### `POST /api/auth/forgot-password`
```
Body: {
  "phone": "9876543210"              // sends SMS OTP via Fast2SMS
}
// OR
Body: {
  "email": "raj@example.com"         // sends email OTP via Resend
}

Response 200: {
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300                    // 5 minutes
}
```

#### `POST /api/auth/reset-password`
```
Body: {
  "phone": "9876543210",             // or "email"
  "otp": "483921",
  "newPassword": "newSecurePass456"
}

Response 200: { "success": true, "message": "Password updated" }
```

---

### 7.2 AI Chat — `/api/chat`

#### `GET /api/chat/conversations`
```
Headers: Authorization: Bearer <accessToken>
Query: ?page=1&limit=20&archived=false

Response 200: {
  "conversations": [
    {
      "id": "conv-uuid-1",
      "title": "Chakra Healing Guidance",
      "messageCount": 24,
      "totalTokens": 4820,
      "contextSummary": "Discussed heart chakra...",
      "updatedAt": "2026-08-06T10:30:00Z",
      "createdAt": "2026-08-06T09:00:00Z"
    },
    ...
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "hasMore": false }
}
```

#### `POST /api/chat/conversations`
```
Headers: Authorization: Bearer <accessToken>
Body: {
  "title": "Morning Meditation",     // optional — auto-generated if empty
  "initialMessage": "Help me with a morning meditation routine"  // optional
}

Response 201: {
  "conversation": {
    "id": "conv-uuid-new",
    "title": "Morning Meditation",
    "messageCount": 0,
    "createdAt": "..."
  }
}
```

#### `GET /api/chat/conversations/:id/messages`
```
Headers: Authorization: Bearer <accessToken>
Query: ?cursor=<lastMessageId>&limit=50

Response 200: {
  "messages": [
    {
      "id": "msg-uuid-1",
      "role": "user",
      "content": "Help me meditate",
      "createdAt": "2026-08-06T09:00:01Z"
    },
    {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "Let's begin with a deep breathing...",
      "model": "gpt-4o",
      "tokensUsed": 245,
      "createdAt": "2026-08-06T09:00:03Z"
    }
  ],
  "pagination": { "cursor": "msg-uuid-1", "hasMore": true }
}
```

#### `POST /api/chat/conversations/:id/messages` *(SSE Streaming)*
```
Headers: Authorization: Bearer <accessToken>
         Accept: text/event-stream
Body: {
  "content": "What is my heart chakra alignment?",
  "context": {                        // optional — frontend can send extra context
    "currentPage": "healing",
    "activeChakra": "heart",
    "auraArchetype": "gold"
  }
}

Response: text/event-stream
  data: {"chunk": "Based on "}
  data: {"chunk": "your heart "}
  data: {"chunk": "chakra alignment..."}
  data: {"chunk": "", "done": true, "messageId": "msg-uuid-3", "tokensUsed": 312}
```

#### `DELETE /api/chat/conversations/:id`
```
Headers: Authorization: Bearer <accessToken>

Response 200: { "success": true, "message": "Conversation deleted" }
```

---

### 7.3 User Profile — `/api/user`

#### `GET /api/user/profile`
```
Headers: Authorization: Bearer <accessToken>

Response 200: {
  "user": {
    "id": "uuid-...",
    "firstName": "Raj",
    "lastName": "Mane",
    "email": "raj@example.com",
    "phone": "9876543210",
    "age": 25,
    "gender": "male",
    "profession": "Developer",
    "avatarUrl": "https://...supabase.co/.../avatar.jpg",
    "digitalTwinUnlocked": true,
    "preferences": { "theme": "dark", "language": "en" },
    "registeredAt": "2026-08-01T...",
    "lastLoginAt": "2026-08-06T..."
  }
}
```

#### `PATCH /api/user/profile`
```
Headers: Authorization: Bearer <accessToken>
Body: {
  "firstName": "Rajesh",             // only send fields to update
  "profession": "Full Stack Dev",
  "preferences": { "theme": "dark", "notifications": true }
}

Response 200: { "success": true, "user": { ...updated } }
```

#### `GET /api/user/devices`
```
Headers: Authorization: Bearer <accessToken>

Response 200: {
  "devices": [
    {
      "sessionId": "sess-uuid-1",
      "deviceInfo": { "browser": "Chrome 125", "os": "Windows 11", "deviceName": "Raj's Laptop" },
      "lastUsedAt": "2026-08-06T10:00:00Z",
      "createdAt": "2026-08-05T...",
      "isCurrent": true
    },
    {
      "sessionId": "sess-uuid-2",
      "deviceInfo": { "browser": "Safari Mobile", "os": "iOS 18", "deviceName": "iPhone" },
      "lastUsedAt": "2026-08-06T08:00:00Z",
      "createdAt": "2026-08-04T...",
      "isCurrent": false
    }
  ]
}
```

#### `DELETE /api/user/devices/:sessionId`
```
Headers: Authorization: Bearer <accessToken>

Response 200: { "success": true, "message": "Device session revoked" }
```

---

### 7.4 Aura Scanner — `/api/aura`

#### `POST /api/aura/scan`
```
Headers: Authorization: Bearer <accessToken>
         Content-Type: multipart/form-data
Body (FormData): {
  "image": <File>,                    // JPEG/PNG aura scan image
  "embedding": "[0.12, -0.34, ...]",  // 128-D face descriptor (JSON string)
  "frequency": "528Hz Solfeggio",
  "resonanceScore": 98.4,
  "auraArchetype": "gold",
  "dominantEmotion": "happy"
}

Response 201: {
  "success": true,
  "scan": {
    "id": "aura-uuid-...",
    "imageUrl": "https://...supabase.co/storage/v1/object/public/aura_scans/scan_xxx.jpg",
    "frequency": "528Hz Solfeggio",
    "resonanceScore": 98.4,
    "createdAt": "..."
  }
}
```

#### `GET /api/aura/latest`
```
Headers: Authorization: Bearer <accessToken>

Response 200: {
  "scan": {
    "id": "...",
    "imageUrl": "...",
    "frequency": "...",
    "resonanceScore": 98.4,
    "auraArchetype": "gold",
    "dominantEmotion": "happy",
    "createdAt": "..."
  }
}
```

#### `POST /api/aura/match`
```
Headers: Authorization: Bearer <accessToken>
Body: {
  "embedding": [0.12, -0.34, ...],   // 128-D float array
  "threshold": 0.6
}

Response 200: {
  "match": true,
  "confidence": 87,                   // percentage
  "aura": {
    "id": "...",
    "imageUrl": "...",
    "frequency": "432Hz Solfeggio",
    "resonanceScore": 97.2
  }
}
```

---

### 7.5 OTP — `/api/otp`

#### `POST /api/otp/send`
```
Body: {
  "type": "phone",                    // "phone" or "email"
  "destination": "9876543210",        // phone number or email address
  "purpose": "registration"           // "registration", "login", "password_reset"
}

Response 200: { "success": true, "expiresIn": 300, "message": "OTP sent" }
```

#### `POST /api/otp/verify`
```
Body: {
  "type": "phone",
  "destination": "9876543210",
  "otp": "483921"
}

Response 200: { "valid": true }
Response 400: { "valid": false, "error": "Invalid OTP", "attemptsRemaining": 3 }
```

---

## 8. AI Chat Engine

### 8.1 System Prompt Architecture

```javascript
// services/chatService.js

function buildSystemPrompt(userProfile, auraData) {
  return `You are the Next Archer AI Companion — a deeply intuitive spiritual guide
and wellness assistant. You combine ancient wisdom traditions (Chakra systems,
Solfeggio frequencies, Maslow's hierarchy) with modern AI to provide
personalized healing guidance.

## About the User
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Age: ${userProfile.age}
- Profession: ${userProfile.profession}
${auraData ? `
## User's Current Aura State
- Aura Archetype: ${auraData.auraArchetype}
- Dominant Emotion: ${auraData.dominantEmotion}
- Solfeggio Frequency: ${auraData.frequency}
- Quantum Resonance Score: ${auraData.resonanceScore}%
` : ''}

## Your Personality
- Warm, empathetic, and non-judgmental
- Blend spiritual vocabulary with scientific grounding
- Reference the user's aura state naturally in responses
- Offer actionable meditation, breathing, and mindfulness exercises
- Never diagnose medical conditions — redirect to professionals when appropriate
- Keep responses concise (2-4 paragraphs) unless asked for detailed guidance

## Conversation Rules
- Remember context from earlier in this conversation
- If the user seems distressed, prioritize emotional support
- Suggest relevant chakra healing exercises when appropriate
- Reference their Solfeggio frequency alignment naturally`;
}
```

### 8.2 AI Router (Multi-Provider Failover)

```javascript
// services/aiRouter.js

class AIRouter {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.primary = process.env.AI_PRIMARY_PROVIDER || 'openai';
  }

  async chatStream(messages, options = {}) {
    const maxTokens = options.maxTokens || parseInt(process.env.AI_MAX_TOKENS);
    const temperature = options.temperature || parseFloat(process.env.AI_TEMPERATURE);

    // Try primary provider
    try {
      if (this.primary === 'openai') {
        return await this.openaiStream(messages, maxTokens, temperature);
      } else {
        return await this.geminiStream(messages, maxTokens, temperature);
      }
    } catch (primaryError) {
      console.error(`[AIRouter] Primary (${this.primary}) failed:`, primaryError.message);

      // Failover to secondary
      try {
        if (this.primary === 'openai') {
          console.log('[AIRouter] Falling back to Gemini...');
          return await this.geminiStream(messages, maxTokens, temperature);
        } else {
          console.log('[AIRouter] Falling back to OpenAI...');
          return await this.openaiStream(messages, maxTokens, temperature);
        }
      } catch (fallbackError) {
        console.error('[AIRouter] Both providers failed:', fallbackError.message);
        throw new Error('AI service temporarily unavailable');
      }
    }
  }

  async *openaiStream(messages, maxTokens, temperature) {
    const stream = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield { chunk: content, model: 'gpt-4o' };
    }
  }

  async *geminiStream(messages, maxTokens, temperature) {
    const model = this.gemini.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });

    // Convert OpenAI message format → Gemini format
    const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastUserMsg = chatHistory.pop();
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction,
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    });

    const result = await chat.sendMessageStream(lastUserMsg.parts[0].text);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield { chunk: text, model: 'gemini-2.5-flash' };
    }
  }
}
```

### 8.3 Chat Controller (SSE Streaming)

```javascript
// controllers/chatController.js

async function sendMessage(req, res) {
  const { id: conversationId } = req.params;
  const { content, context } = req.body;
  const userId = req.userId;

  // 1. Verify conversation belongs to user
  const conv = await chatModel.getConversation(conversationId, userId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  // 2. Save user message
  await chatModel.insertMessage(conversationId, 'user', content);

  // 3. Load context: Redis cache → DB fallback
  let contextMessages = await cacheService.get(`chat:ctx:${conversationId}`);
  if (!contextMessages) {
    contextMessages = await chatModel.getRecentMessages(
      conversationId,
      parseInt(process.env.AI_MAX_CONTEXT_MESSAGES)
    );
    await cacheService.setex(`chat:ctx:${conversationId}`, 3600, contextMessages);
  }

  // 4. Load user profile + aura for system prompt
  const userProfile = await cacheService.getOrFetch(
    `user:${userId}:profile`,
    () => userModel.getById(userId),
    1800
  );
  const latestAura = await auraModel.getLatestByUser(userId);
  const systemPrompt = chatService.buildSystemPrompt(userProfile, latestAura);

  // 5. Build message array for AI
  const messages = [
    { role: 'system', content: systemPrompt },
    ...contextMessages.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content },
  ];

  // 6. Stream AI response via SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';
  let model = 'gpt-4o';

  try {
    const stream = aiRouter.chatStream(messages);
    for await (const { chunk, model: usedModel } of stream) {
      fullResponse += chunk;
      model = usedModel;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }

  // 7. Send completion signal
  const tokensUsed = tokenCounter.count(fullResponse);
  const assistantMsg = await chatModel.insertMessage(
    conversationId, 'assistant', fullResponse, tokensUsed, model
  );
  res.write(`data: ${JSON.stringify({
    chunk: '', done: true,
    messageId: assistantMsg.id,
    tokensUsed,
  })}\n\n`);
  res.end();

  // 8. Update Redis context cache
  contextMessages.push({ role: 'user', content });
  contextMessages.push({ role: 'assistant', content: fullResponse });
  if (contextMessages.length > 40) contextMessages = contextMessages.slice(-20);
  await cacheService.setex(`chat:ctx:${conversationId}`, 3600, contextMessages);

  // 9. Auto-generate title if first message
  if (conv.message_count <= 1) {
    const title = await chatService.generateTitle(content, fullResponse);
    await chatModel.updateTitle(conversationId, title);
  }
}
```

---

## 9. Redis Caching Architecture

### 9.1 Key Space Design

| Key Pattern | TTL | Contents | Purpose |
|------------|-----|----------|---------|
| `session:{userId}` | 30 min | User profile JSON | Auth middleware fast lookup |
| `chat:ctx:{conversationId}` | 1 hour | Last 20 messages array | AI context window loading |
| `chat:convs:{userId}` | 15 min | Conversation list | Dashboard conversation listing |
| `user:{userId}:profile` | 30 min | Full profile object | Profile page, system prompt |
| `user:{userId}:aura` | 1 hour | Latest aura scan | System prompt context |
| `otp:{type}:{destination}` | 5 min | `{ code, attempts, createdAt }` | OTP verification |
| `rate:{ip}:{endpoint}` | varies | Request count integer | Sliding window rate limiter |
| `ai:cache:{promptHash}` | 5 min | AI response text | Identical prompt deduplication |

### 9.2 Cache Service Implementation

```javascript
// services/cacheService.js

class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async get(key) {
    const val = await this.redis.get(key);
    return val ? JSON.parse(val) : null;
  }

  async setex(key, ttlSeconds, data) {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async del(key) {
    await this.redis.del(key);
  }

  // Read-through cache: check Redis first, DB fallback, write to Redis
  async getOrFetch(key, fetchFn, ttlSeconds = 1800) {
    let cached = await this.get(key);
    if (cached) return cached;

    const fresh = await fetchFn();
    if (fresh) await this.setex(key, ttlSeconds, fresh);
    return fresh;
  }

  // Invalidate on write (write-through pattern)
  async invalidate(pattern) {
    // e.g., invalidate('user:uuid-123:*') clears all user caches
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) await this.redis.del(...keys);
  }

  // Invalidate all caches for a specific user
  async invalidateUser(userId) {
    await this.invalidate(`user:${userId}:*`);
    await this.del(`session:${userId}`);
  }
}
```

### 9.3 Cache Invalidation Rules

| Event | Keys Invalidated |
|-------|-----------------|
| User updates profile | `user:{id}:profile`, `session:{id}` |
| User sends chat message | `chat:ctx:{convId}` (updated, not deleted) |
| User creates conversation | `chat:convs:{userId}` |
| User deletes conversation | `chat:convs:{userId}`, `chat:ctx:{convId}` |
| User uploads aura scan | `user:{id}:aura` |
| User logs out | `session:{id}` |
| User password reset | `session:{id}` (force re-auth) |

---

## 10. Cross-Device Sync

### 10.1 How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                    CROSS-DEVICE SYNC MODEL                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PHONE registers ──► Supabase PostgreSQL ◄── LAPTOP logs in      │
│       ↓                    (single source                 ↓       │
│  JWT + localStorage        of truth)              JWT + localStorage│
│                                                                   │
│  All data lives in PostgreSQL:                                    │
│  ✓ User profile          (user_profiles)                         │
│  ✓ Chat history           (chat_conversations + chat_messages)   │
│  ✓ Aura scans             (user_auras + aura_scans bucket)       │
│  ✓ Active sessions        (user_sessions)                        │
│  ✓ Preferences            (user_profiles.preferences JSONB)      │
│                                                                   │
│  localStorage is ONLY used for:                                  │
│  • JWT access token (memory) + refresh token (httpOnly cookie)   │
│  • Offline fallback cache (read-only, synced on reconnect)       │
│                                                                   │
│  Redis ONLY caches hot reads — never the source of truth         │
└──────────────────────────────────────────────────────────────────┘
```

### 10.2 Device Sync Scenarios

| Scenario | What Happens |
|----------|-------------|
| **Register on Phone → Login on Laptop** | Laptop calls `POST /api/auth/login` → gets full profile, conversations, scans from PostgreSQL |
| **Send chat on Laptop → Open Phone** | Phone calls `GET /api/chat/conversations` → sees same conversations + messages from PostgreSQL |
| **Upload aura on Phone → View on Laptop** | Laptop calls `GET /api/aura/latest` → gets same scan from PostgreSQL + image from Supabase CDN |
| **Change password on Phone** | Server invalidates ALL sessions in `user_sessions` → all devices forced to re-login |
| **Lose Phone** | User logs in on Laptop → goes to `/api/user/devices` → revokes Phone's session |
| **Offline on Phone** | App falls back to localStorage cache → syncs when back online |

### 10.3 Offline-First Strategy

```javascript
// Frontend: src/services/apiClient.js

class ApiClient {
  async request(method, url, data, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.status === 401) {
        // Token expired → try refresh
        const refreshed = await this.refreshToken();
        if (refreshed) return this.request(method, url, data, options);
        // Refresh failed → redirect to login
        window.location.href = '/scan';
        return null;
      }

      const result = await response.json();

      // Cache successful reads in localStorage for offline access
      if (method === 'GET' && options.cacheKey) {
        localStorage.setItem(`cache:${options.cacheKey}`, JSON.stringify({
          data: result,
          cachedAt: Date.now(),
        }));
      }

      return result;
    } catch (networkError) {
      // Offline → return cached data if available
      if (method === 'GET' && options.cacheKey) {
        const cached = localStorage.getItem(`cache:${options.cacheKey}`);
        if (cached) {
          const { data, cachedAt } = JSON.parse(cached);
          console.warn(`[Offline] Serving cached data from ${new Date(cachedAt).toLocaleString()}`);
          return { ...data, _cached: true };
        }
      }
      throw networkError;
    }
  }
}
```

---

## 11. Load Balancing & Scaling

### 11.1 Architecture

```
                         Internet
                            │
                            ▼
              ┌──────────────────────────┐
              │    NGINX Load Balancer    │
              │    (Round Robin + Health) │
              └────┬─────┬─────┬─────────┘
                   │     │     │
           ┌───────▼─┐ ┌─▼──────┐ ┌▼────────┐
           │Server #1│ │Server #2│ │Server #3│
           │ :4001   │ │ :4002   │ │ :4003   │
           └────┬────┘ └────┬────┘ └────┬────┘
                │           │           │
                └─────┬─────┘───────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────┐           ┌──────▼────────┐
    │  Redis   │           │   PostgreSQL   │
    │ (shared) │           │   (Supabase)   │
    └──────────┘           └───────────────┘
```

### 11.2 Why Stateless Servers Work

| Component | State Location | Why It Scales |
|-----------|---------------|---------------|
| JWT tokens | Client-side | No server session storage needed |
| User sessions | Redis (shared) | Any server can validate any token |
| Chat context | Redis (shared) | Any server can resume any conversation |
| Rate limits | Redis (shared) | Counts are consistent across servers |
| Database | Supabase (external) | All servers share same PostgreSQL |

### 11.3 Auto-Scaling Rules

| Trigger | Condition | Action |
|---------|-----------|--------|
| CPU | > 70% for 5 minutes | Add 1 Node.js instance |
| Memory | > 80% of container limit | Add 1 Node.js instance |
| Response Time | p95 > 500ms for 3 minutes | Add 1 Node.js instance |
| WebSocket Connections | > 5,000 per server | Add 1 Node.js instance |
| Error Rate | > 5% of requests in 1 minute | Alert + investigate |
| Idle | CPU < 20% for 15 minutes | Remove 1 Node.js instance (min: 1) |

### 11.4 PM2 Cluster Mode (Single Server)

```javascript
// ecosystem.config.js (PM2)
module.exports = {
  apps: [{
    name: 'nextarcher-api',
    script: 'src/index.js',
    instances: 'max',           // Use all CPU cores
    exec_mode: 'cluster',       // Cluster mode for load distribution
    max_memory_restart: '500M', // Restart if > 500MB
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
  }],
};
```

---

## 12. Rate Limiting

### 12.1 Implementation (Redis Sliding Window)

```javascript
// middleware/rateLimiter.js

class RateLimiter {
  constructor(redis) {
    this.redis = redis;
  }

  // Creates middleware with configurable limits per endpoint
  limit({ maxRequests, windowSeconds, keyGenerator }) {
    return async (req, res, next) => {
      const key = `rate:${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);

      // Use Redis sorted set for sliding window
      const pipeline = this.redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);     // Remove expired
      pipeline.zadd(key, now, `${now}-${Math.random()}`); // Add current
      pipeline.zcard(key);                                 // Count in window
      pipeline.expire(key, windowSeconds);                 // Set TTL
      const results = await pipeline.exec();

      const requestCount = results[2][1];

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowSeconds * 1000) / 1000));

      if (requestCount > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: windowSeconds,
          limit: maxRequests,
        });
      }

      next();
    };
  }
}
```

### 12.2 Rate Limit Configuration

| Endpoint | Key | Max Requests | Window | Notes |
|----------|-----|-------------|--------|-------|
| `POST /api/auth/login` | IP address | 5 | 60 sec | Prevent brute-force |
| `POST /api/auth/register` | IP address | 3 | 300 sec | Prevent spam accounts |
| `POST /api/auth/forgot-password` | Phone/Email | 3 | 300 sec | Prevent OTP spam |
| `POST /api/otp/send` | Phone/Email | 3 | 300 sec | OTP delivery cost |
| `POST /api/chat/*/messages` | User ID | 30 | 60 sec | AI API cost control |
| `POST /api/aura/scan` | User ID | 10 | 60 sec | Storage cost control |
| `GET /api/*` (general reads) | User ID | 100 | 60 sec | General protection |

### 12.3 Route Configuration

```javascript
// routes/auth.routes.js
const rateLimit = new RateLimiter(redis);

router.post('/login',
  rateLimit.limit({ maxRequests: 5, windowSeconds: 60, keyGenerator: req => `login:${req.ip}` }),
  validate(authSchemas.login),
  authController.login
);

router.post('/forgot-password',
  rateLimit.limit({ maxRequests: 3, windowSeconds: 300, keyGenerator: req => `forgot:${req.body.phone || req.body.email}` }),
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);
```

---

## 13. WebSocket / Real-Time Layer

### 13.1 Socket.io Setup

```javascript
// socket/socketManager.js

function initializeSocket(server, redis) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS.split(','),
      credentials: true,
    },
    // Redis adapter for multi-server pub/sub
    adapter: createAdapter(redis.duplicate(), redis.duplicate()),
  });

  // Auth middleware for WebSocket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const session = await redis.get(`session:${decoded.userId}`);
      if (!session) return next(new Error('Session expired'));

      socket.userId = decoded.userId;
      socket.user = JSON.parse(session);
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WS] User ${socket.userId} connected`);

    // Join user's personal room (for cross-device notifications)
    socket.join(`user:${socket.userId}`);

    // Chat events
    socket.on('chat:join', (conversationId) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on('chat:leave', (conversationId) => {
      socket.leave(`chat:${conversationId}`);
    });

    socket.on('chat:typing', (conversationId) => {
      socket.to(`chat:${conversationId}`).emit('chat:typing', {
        userId: socket.userId,
        userName: socket.user.first_name,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[WS] User ${socket.userId} disconnected`);
    });
  });

  return io;
}
```

### 13.2 Real-Time Events

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `chat:join` | Client → Server | `conversationId` | Subscribe to conversation updates |
| `chat:leave` | Client → Server | `conversationId` | Unsubscribe from conversation |
| `chat:typing` | Client ↔ Client | `{ userId, userName }` | Typing indicator (future multi-user) |
| `chat:newMessage` | Server → Client | `{ message }` | Push new messages to other devices |
| `aura:scanComplete` | Server → Client | `{ scan }` | Notify when scan processing completes |
| `notification` | Server → Client | `{ title, body }` | General push notifications |

---

## 14. Docker Compose Setup

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ── Node.js API Server ──
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 3                     # 3 instances for load balancing
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # ── Redis Cache ──
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ── NGINX Load Balancer ──
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro       # SSL certificates
      - ../compiledchat/dist:/var/www/frontend:ro  # React build
    depends_on:
      - api
    restart: unless-stopped

volumes:
  redis_data:
```

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY scripts/ ./scripts/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

EXPOSE 4000

CMD ["node", "src/index.js"]
```

---

## 15. NGINX Configuration

```nginx
# nginx/nginx.conf

upstream api_servers {
    least_conn;                        # Route to least-connected server
    server api:4000;
    # With Docker replicas, Docker DNS handles round-robin across 3 instances
}

server {
    listen 80;
    server_name nextarcher.com www.nextarcher.com;

    # Redirect HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nextarcher.com www.nextarcher.com;

    # SSL
    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1024;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://$server_name;" always;

    # ── Static Frontend (React build) ──
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;

        # Cache static assets aggressively
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # ── API Proxy ──
    location /api/ {
        proxy_pass http://api_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE support (no buffering for streaming)
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;        # 5min for long AI responses
    }

    # ── WebSocket ──
    location /socket.io/ {
        proxy_pass http://api_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ── Health Check ──
    location /api/health {
        proxy_pass http://api_servers;
        access_log off;
    }
}
```

---

## 16. Deployment Guide

### 16.1 Option A: Railway (Recommended for MVP)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Add Redis service
railway add --plugin redis

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set SUPABASE_URL=https://qwmnyomlfchazapkohfy.supabase.co
# ... (set all .env variables)

# 6. Deploy
railway up
```

### 16.2 Option B: Docker (VPS / EC2)

```bash
# 1. Clone repo on server
git clone <repo-url>
cd server

# 2. Create .env file
cp .env.example .env
nano .env  # Fill in all values

# 3. Build and run
docker-compose up -d --build

# 4. Check logs
docker-compose logs -f api

# 5. Scale API servers
docker-compose up -d --scale api=5
```

### 16.3 Database Migration

```bash
# 1. Open Supabase SQL Editor
# 2. Paste contents of scripts/migrate.sql
# 3. Execute

# 4. Hash existing plaintext passwords (one-time migration)
node scripts/hashPasswords.js
```

---

## 17. Security Checklist

| # | Item | Status | Implementation |
|---|------|--------|---------------|
| 1 | **Passwords hashed with bcrypt** | Required | `bcryptjs` with salt rounds = 12 |
| 2 | **API keys on server only** | Required | All keys in server `.env`, never in client bundle |
| 3 | **JWT access tokens short-lived** | Required | 15-minute expiry |
| 4 | **Refresh tokens in httpOnly cookies** | Required | `httpOnly`, `Secure`, `SameSite=Strict` |
| 5 | **Refresh token hash in DB** | Required | Store bcrypt hash, not raw token |
| 6 | **Input validation on all endpoints** | Required | Joi schemas for every route |
| 7 | **Rate limiting on auth endpoints** | Required | Redis sliding window |
| 8 | **CORS restricted to known origins** | Required | Whitelist frontend domains |
| 9 | **SQL injection prevention** | Built-in | Supabase SDK uses parameterized queries |
| 10 | **XSS prevention headers** | Required | NGINX `Content-Security-Policy` |
| 11 | **HTTPS enforced** | Required | NGINX HTTP→HTTPS redirect |
| 12 | **Request size limits** | Required | Express `body-parser` limit: 10MB |
| 13 | **File upload validation** | Required | Check MIME type, max size 5MB |
| 14 | **OTP brute-force protection** | Required | Max 5 attempts, then expire |
| 15 | **Session revocation on password change** | Required | Delete all `user_sessions` + Redis flush |
| 16 | **Logging (no sensitive data)** | Required | Winston — never log passwords, tokens |
| 17 | **Service role key secured** | Required | `SUPABASE_SERVICE_ROLE_KEY` server-only |

---

## 18. Frontend Integration Changes

### 18.1 Files to Create

| New File | Purpose |
|----------|---------|
| `src/services/apiClient.js` | Fetch wrapper with JWT auto-attach, refresh, offline fallback |
| `src/services/authService.js` | Login, register, refresh, logout API calls |
| `src/services/chatApiService.js` | SSE streaming chat client, conversations CRUD |
| `src/context/AuthContext.jsx` | React context for auth state (user, isLoggedIn, tokens) |

### 18.2 Files to Modify

| Existing File | Change |
|--------------|--------|
| `storage.js` | Replace direct Supabase calls → `apiClient.post('/api/auth/register')` |
| `otp.js` | Remove all API keys, call `apiClient.post('/api/otp/send')` instead |
| `databaseService.js` | Replace direct Supabase calls → API calls via `apiClient` |
| `ChatScreenPage.jsx` | Remove iframe, build native chat UI with SSE streaming |
| `AuraScannerPage.jsx` | Login/register flows → use `authService` |
| `RegisterPage.jsx` | Registration → use `authService.register()` |
| `App.jsx` | Wrap with `<AuthProvider>`, add protected routes |
| `GlobalNavbar.jsx` | Read auth state from `AuthContext` instead of localStorage |
| `.env` | Remove all API keys (keep only `VITE_API_BASE_URL`) |

### 18.3 New Frontend `.env`

```bash
# compiledchat/.env (after backend migration)
VITE_API_BASE_URL=http://localhost:4000    # development
# VITE_API_BASE_URL=https://api.nextarcher.com  # production
```

> [!IMPORTANT]  
> All other API keys (`Fast2SMS`, `Mailjet`, `Brevo`, `Supabase`) are **removed from the frontend** and only exist in `server/.env`.

---

> [!NOTE]
> **This document is the complete blueprint.** Once approved, we will build the backend `server/` directory step-by-step, starting with the Express server bootstrap, database config, auth system, then AI chat engine.

> [!IMPORTANT]
> **Before starting, please confirm:**
> 1. Do you have an **OpenAI API key** or **Gemini API key** for the AI chat?
> 2. Preferred deployment: **Railway** (easiest) or **Docker on VPS**?
> 3. Should we use **Upstash Redis** (serverless, free tier) or **self-hosted Redis**?
