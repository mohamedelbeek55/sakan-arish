-- =====================================================
-- Arish Student Housing - Supabase Migration
-- =====================================================

-- 1. Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('al_masaeed', 'al_dahiya')),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    rental_type TEXT NOT NULL CHECK (rental_type IN ('bed', 'room', 'full_apartment')),
    price NUMERIC NOT NULL,
    rooms_count INT DEFAULT 1,
    location_desc TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'one_bed_left', 'booked')),
    total_beds INT DEFAULT 1,
    available_beds INT DEFAULT 1,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    youtube_video_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security (RLS)
-- Disabling RLS allows the admin dashboard to perform inserts/updates seamlessly
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you prefer RLS enabled, run:
-- ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow full access to properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Storage Bucket Setup (run these via Supabase Dashboard or API)
-- =====================================================
-- 1. Create a public bucket named "property-images"
-- 2. Set it to public for read access
-- 3. Allow authenticated users to upload
--
-- In the Supabase Dashboard:
-- Go to Storage > Create new bucket > "property-images"
-- Toggle "Public bucket" on
-- Add policies:
--   - SELECT: Allow public access (anon role)
--   - INSERT: Allow authenticated users only
--   - UPDATE: Allow authenticated users only
--   - DELETE: Allow authenticated users only
