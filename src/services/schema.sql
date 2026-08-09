-- Supabase Production SQL Schema for NextArcher (Spiritualize AI)
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query

-- 1. Enable Vector Extension for AI Embedding Searches
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create table for User Aura Scans with Vector Embedding Support
CREATE TABLE IF NOT EXISTS public.user_auras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    image_data TEXT,
    signature JSONB,
    embedding vector(128),
    frequency TEXT DEFAULT '432Hz - 963Hz',
    resonance_score NUMERIC DEFAULT 98.4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
ALTER TABLE public.user_auras ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.user_auras ADD COLUMN IF NOT EXISTS embedding vector(128);

-- 3. Create HNSW Vector Index for Instant <5ms Server-side Distance Searches
CREATE INDEX IF NOT EXISTS user_auras_embedding_hnsw 
ON public.user_auras 
USING hnsw (embedding vector_l2_ops);

-- 4. Create RPC Function for Fast Server-Side Vector Distance Matching
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
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        user_auras.id,
        user_auras.image_url,
        user_auras.image_data,
        user_auras.signature,
        user_auras.frequency,
        user_auras.resonance_score,
        (user_auras.embedding <-> query_embedding)::float AS distance
    FROM public.user_auras
    WHERE user_auras.embedding IS NOT NULL
      AND (user_auras.embedding <-> query_embedding) < match_threshold
    ORDER BY user_auras.embedding <-> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 5. Create table for Micro Tasks
CREATE TABLE IF NOT EXISTS public.micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    reward_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.user_auras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_tasks ENABLE ROW LEVEL SECURITY;

-- 7. Create public access policies for app access
DROP POLICY IF EXISTS "Allow public read/write access to user_auras" ON public.user_auras;
CREATE POLICY "Allow public read/write access to user_auras"
    ON public.user_auras FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to micro_tasks" ON public.micro_tasks;
CREATE POLICY "Allow public read access to micro_tasks"
    ON public.micro_tasks FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert initial sample micro tasks
INSERT INTO public.micro_tasks (title, description, reward_amount, status, completed)
VALUES 
    ('Under 10-Min Micro Tasks', 'Complete quick AI tasks to build steady passive earnings.', 5.00, 'available', false),
    ('Automated Yield', 'Earn rewards automatically as AI models run in background.', 12.50, 'active', false),
    ('Quantum Resonance Check', 'Perform daily aura resonance scan to unlock tier 2 bonuses.', 2.00, 'completed', true)
ON CONFLICT DO NOTHING;

-- 8. Supabase Storage Bucket Setup for Raw Image File Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('aura_scans', 'aura_scans', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read/Write Access for aura_scans Bucket" ON storage.objects;
CREATE POLICY "Public Read/Write Access for aura_scans Bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'aura_scans') 
WITH CHECK (bucket_id = 'aura_scans');

-- 9. Create table for User Profiles & Registration (with Password support)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    age INT,
    gender TEXT,
    profession TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    platform TEXT DEFAULT 'registration',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration rule: Ensure password column exists if user_profiles table already existed
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'spiritual';

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_type 
ON public.chat_sessions(user_id, session_type, created_at DESC);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write access to user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public read/write access to user_profiles"
    ON public.user_profiles FOR ALL
    USING (true)
    WITH CHECK (true);

