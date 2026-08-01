-- Supabase SQL Schema for NextArcher (Spiritualize AI)
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query

-- 1. Create table for User Aura Scans
CREATE TABLE IF NOT EXISTS public.user_auras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_data TEXT,
    signature JSONB,
    frequency TEXT DEFAULT '432Hz - 963Hz',
    resonance_score NUMERIC DEFAULT 98.4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for Micro Tasks
CREATE TABLE IF NOT EXISTS public.micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    reward_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_auras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create public access policies for demo/anonymous app access
CREATE POLICY "Allow public read/write access to user_auras"
    ON public.user_auras FOR ALL
    USING (true)
    WITH CHECK (true);

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

-- 5. Optional: Supabase Storage Bucket Setup for Raw Image File Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('aura_scans', 'aura_scans', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read/Write Access for aura_scans Bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'aura_scans') 
WITH CHECK (bucket_id = 'aura_scans');
