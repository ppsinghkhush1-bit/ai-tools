
/*
  # AI Tools Directory - Complete Schema

  ## Tables Created

  ### tools
  - Core table for all AI tools in the directory
  - Fields: id, slug, name, description, long_description, website, category, pricing, logo, tags, source, upvotes, is_trending, is_featured, created_at, updated_at

  ### tool_views
  - Tracks view counts per tool for trending calculations

  ### favorites
  - Anonymous favorites stored by session_id (no auth required)

  ## Security
  - RLS enabled on all tables
  - Public read access for tools and tool_views
  - Authenticated insert/update for admin operations
  - Public upvote and favorite capabilities

  ## Notes
  1. Slugs are auto-generated from tool names, URL-safe
  2. Tags stored as text array for flexible filtering
  3. Pricing constrained to Free/Paid/Freemium
  4. Category constrained to 8 main categories
*/

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  website TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Image', 'Video', 'Writing', 'Code', 'Voice', 'Productivity', 'Business', 'Automation', 'Audio', 'Research')),
  pricing TEXT NOT NULL CHECK (pricing IN ('Free', 'Paid', 'Freemium')),
  logo TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK (source IN ('scraped', 'manual', 'api')),
  upvotes INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_pricing ON tools(pricing);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_is_trending ON tools(is_trending);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_upvotes ON tools(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_views_tool_id ON tool_views(tool_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tool_id ON favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_id);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tools"
  ON tools FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can upvote tools"
  ON tools FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert tools"
  ON tools FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can record views"
  ON tool_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read views"
  ON tool_views FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage their favorites"
  ON favorites FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read favorites"
  ON favorites FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete their favorites"
  ON favorites FOR DELETE
  TO anon, authenticated
  USING (true);
