-- Migration: Add telemetry columns to users table
-- DROP view first, then add columns, then recreate view

DROP VIEW IF EXISTS public.user_profiles;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS karma_rating NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS my_world_business NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS my_world_family NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS my_world_friend NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS collective_intelligence NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS global_consciousness NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS balanced_thinking NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS weak_chakras JSONB DEFAULT '["throat","solar_plexus"]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telemetry_json JSONB DEFAULT NULL;

CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    id, email, first_name, last_name, full_name, age, gender, profession, phone,
    phone_verified, email_verified,
    karma_rating, my_world_business, my_world_family, my_world_friend,
    collective_intelligence, global_consciousness, balanced_thinking,
    weak_chakras, telemetry_json,
    created_at, updated_at
FROM public.users;
