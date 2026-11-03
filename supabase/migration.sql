-- ==============================================================================
-- Production Database Migration & Security Hardening
-- Project: سكن طلاب العريش (Arish Student Housing)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Admins Table & Helper Function (No Hardcoded Emails)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    email TEXT PRIMARY KEY
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the caller is a verified admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
    current_email text;
BEGIN
    current_email := LOWER(auth.jwt() ->> 'email');
    IF current_email IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.admins WHERE LOWER(admins.email) = current_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS policies for admins table
DROP POLICY IF EXISTS "Admin select admins" ON public.admins;
DROP POLICY IF EXISTS "Admin insert admins" ON public.admins;
DROP POLICY IF EXISTS "Admin update admins" ON public.admins;
DROP POLICY IF EXISTS "Admin delete admins" ON public.admins;

CREATE POLICY "Admin select admins"
ON public.admins FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin insert admins"
ON public.admins FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin update admins"
ON public.admins FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete admins"
ON public.admins FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. `public.properties` Table Setup & Columns
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

-- Add newly required columns with NULL defaults (no fake data on existing rows)
ALTER TABLE public.properties 
    ADD COLUMN IF NOT EXISTS walking_minutes_to_university INT,
    ADD COLUMN IF NOT EXISTS maps_url TEXT,
    ADD COLUMN IF NOT EXISTS floor INT,
    ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS contract_months INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS students_per_room INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Remove columns if they existed previously to prevent leaks and race conditions
ALTER TABLE public.properties 
    DROP COLUMN IF EXISTS owner_phone,
    DROP COLUMN IF EXISTS whatsapp_clicks;

-- Ensure defaults for extended columns are strictly NULL
ALTER TABLE public.properties 
    ALTER COLUMN furnished DROP DEFAULT,
    ALTER COLUMN utilities_included DROP DEFAULT,
    ALTER COLUMN deposit DROP DEFAULT,
    ALTER COLUMN contract_months DROP DEFAULT,
    ALTER COLUMN students_per_room DROP DEFAULT,
    ALTER COLUMN last_verified_at DROP DEFAULT;

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
-- 3. `public.property_private` Table (Admin-only storage for sensitive fields)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_private (
    property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_phone TEXT
);

ALTER TABLE public.property_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin property_private select" ON public.property_private;
DROP POLICY IF EXISTS "Admin property_private insert" ON public.property_private;
DROP POLICY IF EXISTS "Admin property_private update" ON public.property_private;
DROP POLICY IF EXISTS "Admin property_private delete" ON public.property_private;

CREATE POLICY "Admin property_private select"
ON public.property_private FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin property_private insert"
ON public.property_private FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin property_private update"
ON public.property_private FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin property_private delete"
ON public.property_private FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) for Properties Table
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

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
-- 5. Property Submissions Table (`public.submissions`)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_name VARCHAR(100) NOT NULL CHECK (char_length(owner_name) >= 2 AND char_length(owner_name) <= 100),
    owner_phone VARCHAR(20) NOT NULL CHECK (char_length(owner_phone) >= 10 AND char_length(owner_phone) <= 20),
    title VARCHAR(200) NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    area TEXT NOT NULL CHECK (area IN ('al_masaeed', 'al_dahiya')),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    rental_type TEXT NOT NULL CHECK (rental_type IN ('bed', 'room', 'full_apartment')),
    price NUMERIC NOT NULL CHECK (price > 0),
    rooms_count INT NOT NULL DEFAULT 1 CHECK (rooms_count >= 1),
    total_beds INT NOT NULL DEFAULT 1 CHECK (total_beds >= 1),
    available_beds INT NOT NULL DEFAULT 1 CHECK (available_beds >= 0),
    walking_minutes_to_university INT CHECK (walking_minutes_to_university IS NULL OR (walking_minutes_to_university >= 0 AND walking_minutes_to_university <= 180)),
    location_desc TEXT CHECK (location_desc IS NULL OR char_length(location_desc) <= 500),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 2000),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint: available beds cannot exceed total beds in submissions
ALTER TABLE public.submissions 
    DROP CONSTRAINT IF EXISTS check_submissions_available_beds_lte_total;
ALTER TABLE public.submissions 
    ADD CONSTRAINT check_submissions_available_beds_lte_total 
    CHECK (available_beds <= total_beds);

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
-- 6. WhatsApp Click Analytics Table (`public.property_clicks`)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_clicks_property_id ON public.property_clicks (property_id);

ALTER TABLE public.property_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public property clicks insert" ON public.property_clicks;
DROP POLICY IF EXISTS "Admin property clicks select" ON public.property_clicks;

-- (A) Any visitor can log a WhatsApp click (requires valid property_id)
CREATE POLICY "Public property clicks insert"
ON public.property_clicks FOR INSERT
TO public
WITH CHECK (property_id IS NOT NULL);

-- (B) Admin-only analytics read access
CREATE POLICY "Admin property clicks select"
ON public.property_clicks FOR SELECT
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. Atomic Submission Approval Function (PostgreSQL RPC)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_submission(p_submission_id UUID)
RETURNS UUID AS $$
DECLARE
    sub RECORD;
    v_prefix TEXT;
    v_next_num INT;
    v_code TEXT;
    v_property_id UUID;
    v_attempts INT := 0;
    v_max_attempts INT := 10;
    v_inserted BOOLEAN := false;
BEGIN
    -- 1. Ensure caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مصرح لك بتنفيذ هذه العملية' USING ERRCODE = '42501';
    END IF;

    -- 2. Fetch submission and lock row for update
    SELECT * INTO sub
    FROM public.submissions
    WHERE id = p_submission_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'طلب السكن غير موجود';
    END IF;

    IF sub.status <> 'pending' THEN
        RAISE EXCEPTION 'لا يمكن اعتماد هذا الطلب لأنه تمت معالجته مسبقاً (الحالة الحالية: %)', sub.status;
    END IF;

    -- 3. Area prefix
    IF sub.area = 'al_masaeed' THEN
        v_prefix := 'MS';
    ELSE
        v_prefix := 'DH';
    END IF;

    -- 4. Find next sequential number by inspecting existing codes with prefix
    SELECT COALESCE(MAX(
        CASE 
            WHEN code ~ ('^' || v_prefix || '-[0-9]+$') 
            THEN SUBSTRING(code FROM ('^' || v_prefix || '-([0-9]+)$'))::INT
            ELSE 0
        END
    ), 0) + 1
    INTO v_next_num
    FROM public.properties
    WHERE code LIKE (v_prefix || '-%');

    -- 5. Loop with retry on unique violation
    WHILE NOT v_inserted AND v_attempts < v_max_attempts LOOP
        v_attempts := v_attempts + 1;
        v_code := v_prefix || '-' || LPAD(v_next_num::TEXT, 2, '0');

        BEGIN
            INSERT INTO public.properties (
                code,
                title,
                area,
                gender,
                rental_type,
                price,
                rooms_count,
                total_beds,
                available_beds,
                walking_minutes_to_university,
                location_desc,
                description,
                status,
                last_verified_at,
                amenities,
                images
            ) VALUES (
                v_code,
                sub.title,
                sub.area,
                sub.gender,
                sub.rental_type,
                sub.price,
                COALESCE(sub.rooms_count, 1),
                COALESCE(sub.total_beds, 1),
                COALESCE(sub.available_beds, sub.total_beds, 1),
                sub.walking_minutes_to_university,
                COALESCE(sub.location_desc, ''),
                COALESCE(sub.description, ''),
                'available',
                NULL,
                '{}',
                '{}'
            ) RETURNING id INTO v_property_id;

            v_inserted := true;
        EXCEPTION WHEN unique_violation THEN
            v_next_num := v_next_num + 1;
        END;
    END LOOP;

    IF NOT v_inserted THEN
        RAISE EXCEPTION 'تعذر إنشاء كود فريد للسكن بعد عدة محاولات';
    END IF;

    -- 6. Insert owner phone into private table if provided
    IF sub.owner_phone IS NOT NULL AND TRIM(sub.owner_phone) <> '' THEN
        INSERT INTO public.property_private (property_id, owner_phone)
        VALUES (v_property_id, TRIM(sub.owner_phone))
        ON CONFLICT (property_id) DO UPDATE SET owner_phone = EXCLUDED.owner_phone;
    END IF;

    -- 7. Update submission status to approved
    UPDATE public.submissions
    SET status = 'approved'
    WHERE id = p_submission_id;

    RETURN v_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 8. Storage Bucket Setup & Hardening (`property-images`)
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
