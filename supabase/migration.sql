-- ==============================================================================
-- Production Database Migration & Security Hardening
-- Project: سكن طلاب العريش (Arish Student Housing)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create or Update `public.properties` Table with all New Columns
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('al_masaeed', 'al_dahiya')),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    rental_type TEXT NOT NULL CHECK (rental_type IN ('bed', 'room', 'full_apartment')),
    price NUMERIC NOT NULL CHECK (price > 0),
    rooms_count INT NOT NULL DEFAULT 1 CHECK (rooms_count >= 1),
    location_desc TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'one_bed_left', 'booked')),
    total_beds INT NOT NULL DEFAULT 1 CHECK (total_beds >= 1),
    available_beds INT NOT NULL DEFAULT 1 CHECK (available_beds >= 0),
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    youtube_video_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add newly required columns idempotently
ALTER TABLE public.properties 
    ADD COLUMN IF NOT EXISTS walking_minutes_to_university INT,
    ADD COLUMN IF NOT EXISTS maps_url TEXT,
    ADD COLUMN IF NOT EXISTS floor INT,
    ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS contract_months INT DEFAULT 10,
    ADD COLUMN IF NOT EXISTS students_per_room INT DEFAULT 2,
    ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS owner_phone TEXT,
    ADD COLUMN IF NOT EXISTS whatsapp_clicks INT DEFAULT 0;

-- Constraint: available beds cannot exceed total beds
ALTER TABLE public.properties 
    DROP CONSTRAINT IF EXISTS check_available_beds_lte_total;
ALTER TABLE public.properties 
    ADD CONSTRAINT check_available_beds_lte_total 
    CHECK (available_beds <= total_beds);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_code ON public.properties (code);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties (area);
CREATE INDEX IF NOT EXISTS idx_properties_gender ON public.properties (gender);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties (price);

-- ------------------------------------------------------------------------------
-- 2. Define Admin Helper Function (Checks Authenticated User Email)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        LOWER(auth.jwt() ->> 'email') = LOWER('mohamed.elbeek88@gmail.com'),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) for Properties Table
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
DROP POLICY IF EXISTS "Public properties select" ON public.properties;
DROP POLICY IF EXISTS "Authenticated admins can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admin properties insert" ON public.properties;
DROP POLICY IF EXISTS "Authenticated admins can update properties" ON public.properties;
DROP POLICY IF EXISTS "Admin properties update" ON public.properties;
DROP POLICY IF EXISTS "Authenticated admins can delete properties" ON public.properties;
DROP POLICY IF EXISTS "Admin properties delete" ON public.properties;
DROP POLICY IF EXISTS "Allow full access to properties" ON public.properties;

-- (A) Public read-only access for students and visitors
CREATE POLICY "Public properties select"
ON public.properties FOR SELECT
TO public
USING (true);

-- (B) Admin-only insert
CREATE POLICY "Admin properties insert"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- (C) Admin-only update
CREATE POLICY "Admin properties update"
ON public.properties FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- (D) Admin-only delete
CREATE POLICY "Admin properties delete"
ON public.properties FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Property Submissions Table (`public.submissions`)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    title TEXT NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('al_masaeed', 'al_dahiya')),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    rental_type TEXT NOT NULL CHECK (rental_type IN ('bed', 'room', 'full_apartment')),
    price NUMERIC NOT NULL CHECK (price > 0),
    rooms_count INT NOT NULL DEFAULT 1 CHECK (rooms_count >= 1),
    total_beds INT NOT NULL DEFAULT 1 CHECK (total_beds >= 1),
    available_beds INT NOT NULL DEFAULT 1 CHECK (available_beds >= 0),
    walking_minutes_to_university INT,
    location_desc TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions (created_at DESC);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public submissions insert" ON public.submissions;
DROP POLICY IF EXISTS "Admin submissions select" ON public.submissions;
DROP POLICY IF EXISTS "Admin submissions update" ON public.submissions;
DROP POLICY IF EXISTS "Admin submissions delete" ON public.submissions;

-- (A) Anonymous & authenticated users can INSERT submissions (public submission form)
CREATE POLICY "Public submissions insert"
ON public.submissions FOR INSERT
TO public
WITH CHECK (true);

-- (B) Admin-only SELECT, UPDATE, DELETE
CREATE POLICY "Admin submissions select"
ON public.submissions FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin submissions update"
ON public.submissions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin submissions delete"
ON public.submissions FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. WhatsApp Click Analytics Table (`public.property_clicks`)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_clicks_property_id ON public.property_clicks (property_id);

ALTER TABLE public.property_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public property clicks insert" ON public.property_clicks;
DROP POLICY IF EXISTS "Admin property clicks select" ON public.property_clicks;

-- (A) Any visitor can log a WhatsApp click
CREATE POLICY "Public property clicks insert"
ON public.property_clicks FOR INSERT
TO public
WITH CHECK (true);

-- (B) Admin-only analytics read access
CREATE POLICY "Admin property clicks select"
ON public.property_clicks FOR SELECT
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. Storage Bucket Setup & Hardening (`property-images`)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images',
    'property-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop old storage policies
DROP POLICY IF EXISTS "Allow public read property-images" ON storage.objects;
DROP POLICY IF EXISTS "Public property-images select" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin property-images insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin property-images update" ON storage.objects;
DROP POLICY IF EXISTS "Allow update and delete property-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin property-images delete" ON storage.objects;

-- (A) Public can view images
CREATE POLICY "Public property-images select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- (B) Only verified admin can upload images
CREATE POLICY "Admin property-images insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-images'
    AND public.is_admin()
);

-- (C) Only verified admin can update images
CREATE POLICY "Admin property-images update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'property-images'
    AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'property-images'
    AND public.is_admin()
);

-- (D) Only verified admin can delete images
CREATE POLICY "Admin property-images delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-images'
    AND public.is_admin()
);

-- ==============================================================================
-- CRITICAL DASHBOARD SETTING: Disable Email Signups
-- ==============================================================================
-- To prevent unauthorized users from creating accounts in your production Supabase:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/yvvudsfgmqhwspzkjvfr
-- 2. Go to: Authentication > Providers > Email
-- 3. Toggle OFF: "Enable Sign Up"
-- ==============================================================================
