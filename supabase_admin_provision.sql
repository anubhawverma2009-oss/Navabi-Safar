-- ==============================================================================
-- NAWABI SAFAR: AUTHORITATIVE ADMIN PROVISIONING & REALTIME ACTIVATION
-- ==============================================================================
-- Project: Nawabi Safar — SIH 2026 (Lucknow Tourism & Heritage Discovery)
-- Purpose: 
--   1. Confirm the registered admin user in auth.users (email_confirmed_at = now()).
--   2. Authorize the admin user in public.admin_users (is_active = true, role = 'super_admin').
--   3. Ensure public.is_admin() evaluates to true for authenticated admin sessions.
--   4. Enable Supabase Realtime publication for places, businesses, emergency, and feedback tables.
-- Execution: Copy and execute this entire script in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Ensure public.admin_users exists with strict constraints
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_users' AND policyname = 'Admins can view admin list'
    ) THEN
        CREATE POLICY "Admins can view admin list"
            ON public.admin_users FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- 2. Ensure public.is_admin() is security definer and accurately verifies admin status
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

-- 3. Confirm admin@nawabisafar.in in auth.users and link to public.admin_users
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'admin@nawabisafar.in';
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Confirm email if unconfirmed
        UPDATE auth.users
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc'::text, now())),
            confirmed_at = COALESCE(confirmed_at, timezone('utc'::text, now())),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_user_id;

        -- Upsert into public.admin_users
        INSERT INTO public.admin_users (user_id, email, role, is_active)
        VALUES (v_user_id, v_email, 'super_admin', true)
        ON CONFLICT (user_id) DO UPDATE
        SET 
            role = 'super_admin',
            is_active = true;
            
        RAISE NOTICE 'Admin user % (%) successfully confirmed and provisioned in public.admin_users', v_email, v_user_id;
    ELSE
        RAISE WARNING 'User % does not exist in auth.users yet. Create user via Supabase Auth Dashboard or App Login first.', v_email;
    END IF;
END $$;

-- 4. Enable Supabase Realtime for live cross-device synchronization
DO $$
BEGIN
    -- Add tables to supabase_realtime publication idempotently
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.places;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.local_businesses;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_services;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.place_reviews;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_feedback;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_reports;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 5. Verification Query (Returns the provisioned admin record)
SELECT 
    u.id AS auth_user_id,
    u.email,
    u.email_confirmed_at,
    a.role,
    a.is_active,
    a.created_at AS admin_registered_at
FROM auth.users u
JOIN public.admin_users a ON u.id = a.user_id
WHERE u.email = 'admin@nawabisafar.in';
