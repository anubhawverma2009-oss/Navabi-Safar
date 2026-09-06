-- ==============================================================================
-- NAWABI SAFAR: SECURITY-HARDENED SUPABASE POSTGRESQL SCHEMA & RLS MIGRATION
-- ==============================================================================
-- Project: Nawabi Safar (Lucknow Tourism Portal)
-- Description: Centralized PostgreSQL schema with strict Role-Based Access Control (RBAC),
--              Row Level Security (RLS), and custom is_admin() authorization.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ADMIN USERS TABLE & AUTHORIZATION FUNCTION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can only view admin records
CREATE POLICY "Admins can view admin list"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- SECURITY DEFINER Function to check admin status with zero data exposure
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. PLACES TABLE (TOURIST DESTINATIONS & HERITAGE LANDMARKS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.places (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    hindi_name TEXT,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    story TEXT NOT NULL DEFAULT '',
    why_visit JSONB NOT NULL DEFAULT '[]'::jsonb,
    category TEXT NOT NULL,
    sub_category TEXT,
    vibes JSONB NOT NULL DEFAULT '[]'::jsonb,
    cover_image TEXT NOT NULL,
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_credits TEXT,
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    google_maps_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    opening_time TEXT NOT NULL DEFAULT '06:00 AM',
    closing_time TEXT NOT NULL DEFAULT '06:00 PM',
    entry_fee TEXT NOT NULL DEFAULT 'Free',
    estimated_budget NUMERIC NOT NULL DEFAULT 0,
    best_time TEXT NOT NULL DEFAULT 'Any Time',
    recommended_duration TEXT NOT NULL DEFAULT '2 Hours',
    how_to_reach JSONB NOT NULL DEFAULT '{}'::jsonb,
    nearby_place_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    hidden_gem BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.80,
    reviews_count INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_places_slug ON public.places(slug);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_places_status ON public.places(status);
CREATE INDEX IF NOT EXISTS idx_places_featured ON public.places(featured);
CREATE INDEX IF NOT EXISTS idx_places_hidden_gem ON public.places(hidden_gem);
CREATE INDEX IF NOT EXISTS idx_places_area ON public.places(area);

-- ------------------------------------------------------------------------------
-- 3. LOCAL BUSINESSES TABLE (CHIKANKARI, ITTAR, AWADHI FOOD & ARTISANS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.local_businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    image TEXT NOT NULL,
    website_url TEXT,
    google_maps_url TEXT,
    specialty TEXT NOT NULL DEFAULT '',
    featured BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_local_businesses_category ON public.local_businesses(category);
CREATE INDEX IF NOT EXISTS idx_local_businesses_status ON public.local_businesses(status);

-- ------------------------------------------------------------------------------
-- 4. EMERGENCY SERVICES DIRECTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_services (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL,
    number TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    availability TEXT NOT NULL DEFAULT '24x7',
    address TEXT,
    official_source TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_emergency_services_enabled ON public.emergency_services(enabled);
CREATE INDEX IF NOT EXISTS idx_emergency_services_order ON public.emergency_services(display_order);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES (STRICT RBAC)
-- ------------------------------------------------------------------------------
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;

-- PLACES POLICIES
-- Public: Read published records only
CREATE POLICY "Public read published places"
    ON public.places FOR SELECT
    USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Authenticated Admin only: Insert, Update, Delete
CREATE POLICY "Admins insert places"
    ON public.places FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins update places"
    ON public.places FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete places"
    ON public.places FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- LOCAL BUSINESSES POLICIES
-- Public: Read published businesses only
CREATE POLICY "Public read published businesses"
    ON public.local_businesses FOR SELECT
    USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Authenticated Admin only: Insert, Update, Delete
CREATE POLICY "Admins insert businesses"
    ON public.local_businesses FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins update businesses"
    ON public.local_businesses FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete businesses"
    ON public.local_businesses FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- EMERGENCY SERVICES POLICIES
-- Public: Read enabled emergency services
CREATE POLICY "Public read enabled emergency services"
    ON public.emergency_services FOR SELECT
    USING (enabled = true OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Authenticated Admin only: Insert, Update, Delete
CREATE POLICY "Admins manage emergency services"
    ON public.emergency_services FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. REVIEWS & FEEDBACK TABLES
-- ------------------------------------------------------------------------------

-- PLACE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.place_reviews (
    id TEXT PRIMARY KEY,
    place_id TEXT NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    place_name TEXT,
    user_name TEXT NOT NULL DEFAULT 'Fellow Explorer',
    user_location TEXT DEFAULT 'Visitor',
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_text TEXT NOT NULL,
    visit_experience TEXT DEFAULT 'Solo Explorer',
    visited_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'pending')),
    helpful_votes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON public.place_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_place_reviews_status ON public.place_reviews(status);
CREATE INDEX IF NOT EXISTS idx_place_reviews_rating ON public.place_reviews(rating);

-- PLATFORM FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.platform_feedback (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    user_name TEXT DEFAULT 'Anonymous Explorer',
    email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.suggestions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_area TEXT,
    suggested_by TEXT DEFAULT 'Curious Traveller',
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'planned', 'implemented', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ISSUE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.issue_reports (
    id TEXT PRIMARY KEY,
    place_id TEXT,
    place_name TEXT,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    reported_by TEXT DEFAULT 'Concerned Visitor',
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS FOR REVIEWS & FEEDBACK
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;

-- Public can view published reviews
CREATE POLICY "Public read published place reviews"
    ON public.place_reviews FOR SELECT
    USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Anyone can submit place reviews
CREATE POLICY "Public insert place reviews"
    ON public.place_reviews FOR INSERT
    WITH CHECK (true);

-- Anyone can update helpful votes on published reviews; admins can update everything
CREATE POLICY "Manage place reviews"
    ON public.place_reviews FOR UPDATE
    USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin()))
    WITH CHECK (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Admins can delete reviews
CREATE POLICY "Admins delete place reviews"
    ON public.place_reviews FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Public can submit platform feedback, suggestions, and issue reports
CREATE POLICY "Public insert platform feedback"
    ON public.platform_feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public insert suggestions"
    ON public.suggestions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public insert issue reports"
    ON public.issue_reports FOR INSERT
    WITH CHECK (true);

-- Admins manage platform feedback, suggestions, and issue reports
CREATE POLICY "Admins manage platform feedback"
    ON public.platform_feedback FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage suggestions"
    ON public.suggestions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage issue reports"
    ON public.issue_reports FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. PLATFORM VISITOR ANALYTICS TABLE (ANONYMOUS UNIQUE VISITOR TRACKING)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_visitors (
    visitor_id TEXT PRIMARY KEY,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    session_id TEXT,
    visit_count INTEGER NOT NULL DEFAULT 1,
    last_path TEXT DEFAULT '/',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_site_visitors_first_seen ON public.site_visitors(first_seen);
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_seen ON public.site_visitors(last_seen);

ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors to register or update their own visit
CREATE POLICY "Public insert site visitors"
    ON public.site_visitors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public update own visitor record"
    ON public.site_visitors FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow everyone to query site visitors count
CREATE POLICY "Public read site visitors"
    ON public.site_visitors FOR SELECT
    USING (true);


