-- NextArcher / Spiritualize AI — Production PostgreSQL Schema (v2)
-- Execute in Supabase SQL Editor: Dashboard -> SQL Editor -> New Query

-- 1. Enable Vector Extension for 128-D Face Vector Storage
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT DEFAULT '',
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    full_name     TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    age           INT CHECK (age >= 13 AND age <= 120),
    gender        TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
    profession    TEXT,
    phone         TEXT,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- 2.1 Backward Compatibility View for user_profiles REST queries
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    full_name, 
    age, 
    gender, 
    profession, 
    phone, 
    phone_verified, 
    email_verified, 
    created_at, 
    updated_at
FROM public.users;

-- 3. Face Descriptors Table (pgvector 128-D Vector for Face ID Login)
CREATE TABLE IF NOT EXISTS public.face_descriptors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    embedding   vector(128) NOT NULL,
    device      TEXT DEFAULT 'web',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT  unique_user_face UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_face_embedding_hnsw 
ON public.face_descriptors 
USING hnsw (embedding vector_l2_ops);

-- RPC Function for Server-Side Face Match (<5ms)
CREATE OR REPLACE FUNCTION match_face_descriptor(
    query_embedding vector(128),
    match_threshold float DEFAULT 0.6
)
RETURNS TABLE (
    user_id UUID,
    distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        face_descriptors.user_id,
        (face_descriptors.embedding <-> query_embedding)::float AS distance
    FROM public.face_descriptors
    WHERE face_descriptors.embedding IS NOT NULL
      AND (face_descriptors.embedding <-> query_embedding) < match_threshold
    ORDER BY face_descriptors.embedding <-> query_embedding ASC
    LIMIT 1;
END;
$$;

-- 4. Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title       TEXT DEFAULT 'New Chat',
    status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    session_type TEXT DEFAULT 'spiritual',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    ended_at    TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for separated chat histories ('spiritual' vs 'twin')
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_type 
ON public.chat_sessions(user_id, session_type, created_at DESC);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages (session_id, created_at ASC);

-- 6. Session Analysis Table (LLM Analysis Output)
CREATE TABLE IF NOT EXISTS public.session_analysis (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id                    UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id                       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    weak_chakra                   TEXT,
    chakra_glow_levels            JSONB DEFAULT '{"root":0,"sacral":0,"solar_plexus":0,"heart":0,"throat":0,"third_eye":0,"crown":0}'::jsonb,
    psychological_score           JSONB,
    collective_intelligence_index NUMERIC DEFAULT 0,
    global_consciousness_score    NUMERIC DEFAULT 0,
    balanced_talking_ratio        NUMERIC DEFAULT 0,
    raw_summary                   TEXT,
    created_at                    TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT                    unique_session_analysis UNIQUE (session_id)
);

CREATE INDEX IF NOT EXISTS idx_session_analysis_user ON public.session_analysis (user_id, created_at DESC);

-- 7. User Dashboard Telemetry Table (Initial Zero-Baseline for New Users)
CREATE TABLE IF NOT EXISTS public.user_dashboard (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    karma_rating                  NUMERIC DEFAULT 0,
    veto_status                   TEXT DEFAULT 'Safe + No Burnout',
    world_business_pct            NUMERIC DEFAULT 0,
    world_family_pct              NUMERIC DEFAULT 0,
    world_friend_pct              NUMERIC DEFAULT 0,
    maslow_physiological          NUMERIC DEFAULT 0,
    maslow_safety_order           NUMERIC DEFAULT 0,
    maslow_belonging              NUMERIC DEFAULT 0,
    maslow_self_esteem            NUMERIC DEFAULT 0,
    maslow_actualization          NUMERIC DEFAULT 0,
    updated_at                    TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT                    unique_user_dashboard UNIQUE (user_id)
);

-- 8. Digital Twins Table
CREATE TABLE IF NOT EXISTS public.digital_twins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    twin_name       TEXT NOT NULL,
    photo_url       TEXT,
    bw_filter       TEXT DEFAULT 'dramatic' CHECK (bw_filter IN ('dramatic', 'ethereal', 'noir')),
    sacred_ring     TEXT DEFAULT 'halo' CHECK (sacred_ring IN ('halo', 'grid', 'matrix')),
    glow_intensity  INT DEFAULT 85 CHECK (glow_intensity >= 0 AND glow_intensity <= 100),
    soul_card_url   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT      unique_user_digital_twin UNIQUE (user_id)
);

-- 9. Micro Tasks Table
CREATE TABLE IF NOT EXISTS public.micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    reward_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.micro_tasks (title, description, reward_amount, status, completed)
VALUES 
    ('Under 10-Min Micro Tasks', 'Complete quick AI tasks to build steady passive earnings.', 5.00, 'available', false),
    ('Automated Yield', 'Earn rewards automatically as AI models run in background.', 12.50, 'active', false),
    ('Quantum Resonance Check', 'Perform daily aura resonance scan to unlock tier 2 bonuses.', 2.00, 'completed', true)
ON CONFLICT DO NOTHING;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_tasks ENABLE ROW LEVEL SECURITY;
