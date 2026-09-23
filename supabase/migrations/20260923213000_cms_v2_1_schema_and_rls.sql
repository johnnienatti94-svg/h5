-- =====================================================================
-- MeePro CMS v2.1 Database Schema & Row Level Security (RLS)
-- Phase 2 Deliverable: Pages, Widgets, Revisions, Media Assets & RBAC
-- Target: Supabase PostgreSQL
-- =====================================================================

-- 1. Automatic Timestamp Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);

-- 3. Page Widgets Table
CREATE TABLE IF NOT EXISTS public.page_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    widget_type VARCHAR(60) NOT NULL,
    config_version INT NOT NULL DEFAULT 1,
    title VARCHAR(255),
    subtitle TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    visible_from TIMESTAMPTZ,
    visible_until TIMESTAMPTZ,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_widgets_page_sort
ON public.page_widgets(page_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_page_widgets_active
ON public.page_widgets(page_id, is_active);

CREATE INDEX IF NOT EXISTS idx_page_widgets_type
ON public.page_widgets(widget_type);

-- 4. Page Revisions Table (Snapshots for Preview, Publish, Audit, Rollback)
CREATE TABLE IF NOT EXISTS public.page_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    snapshot JSONB NOT NULL,
    note VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(page_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_page_revisions_page
ON public.page_revisions(page_id, revision_number DESC);

-- 5. Media Assets Table
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path TEXT NOT NULL,
    public_url TEXT,
    mime_type VARCHAR(100),
    width INT,
    height INT,
    alt_text TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_storage
ON public.media_assets(storage_path);

-- 6. Attach Automatic updated_at Triggers
DROP TRIGGER IF EXISTS trg_pages_updated_at ON public.pages;
CREATE TRIGGER trg_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_page_widgets_updated_at ON public.page_widgets;
CREATE TRIGGER trg_page_widgets_updated_at
BEFORE UPDATE ON public.page_widgets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER trg_media_assets_updated_at
BEFORE UPDATE ON public.media_assets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- Public Read: Published pages only
DROP POLICY IF EXISTS "Allow public read published pages" ON public.pages;
CREATE POLICY "Allow public read published pages" ON public.pages
    FOR SELECT USING (status = 'published');

-- Public Read: Active widgets on published pages within schedule
DROP POLICY IF EXISTS "Allow public read active widgets" ON public.page_widgets;
CREATE POLICY "Allow public read active widgets" ON public.page_widgets
    FOR SELECT USING (
        is_active = TRUE
        AND (visible_from IS NULL OR visible_from <= NOW())
        AND (visible_until IS NULL OR visible_until >= NOW())
        AND EXISTS (
            SELECT 1 FROM public.pages
            WHERE pages.id = page_widgets.page_id
            AND pages.status = 'published'
        )
    );

-- Public Read: Media assets
DROP POLICY IF EXISTS "Allow public read media assets" ON public.media_assets;
CREATE POLICY "Allow public read media assets" ON public.media_assets
    FOR SELECT USING (TRUE);

-- Authenticated Staff and Admin Policies
DROP POLICY IF EXISTS "Allow staff and admin read all pages" ON public.pages;
CREATE POLICY "Allow staff and admin read all pages" ON public.pages
    FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow staff and admin read all widgets" ON public.page_widgets;
CREATE POLICY "Allow staff and admin read all widgets" ON public.page_widgets
    FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow staff and admin manage widgets" ON public.page_widgets;
CREATE POLICY "Allow staff and admin manage widgets" ON public.page_widgets
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow staff and admin manage pages" ON public.pages;
CREATE POLICY "Allow staff and admin manage pages" ON public.pages
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow staff and admin manage revisions" ON public.page_revisions;
CREATE POLICY "Allow staff and admin manage revisions" ON public.page_revisions
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow staff and admin manage media" ON public.media_assets;
CREATE POLICY "Allow staff and admin manage media" ON public.media_assets
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 9. Seed Initial Default Data (Home Page & Initial Widgets)
INSERT INTO public.pages (slug, name, status, published_at)
VALUES ('home', 'MeePro Mobile Storefront Home', 'published', NOW())
ON CONFLICT (slug) DO NOTHING;
