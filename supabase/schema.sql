-- ─────────────────────────────────────────────
-- Groups
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_groups"   ON groups;
DROP POLICY IF EXISTS "anon_insert_groups" ON groups;
CREATE POLICY "anon_read_groups"   ON groups FOR SELECT USING (true);
CREATE POLICY "anon_insert_groups" ON groups FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- Constraints (one per member per group)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS constraints (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id       uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name           text NOT NULL,
  max_rent       integer NOT NULL,
  excluded_areas text[]  NOT NULL DEFAULT '{}',
  hard           jsonb   NOT NULL DEFAULT '{}',
  soft           jsonb   NOT NULL DEFAULT '{}',
  created_at     timestamptz DEFAULT now(),
  UNIQUE (group_id, name)
);

ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_constraints"  ON constraints;
DROP POLICY IF EXISTS "read_after_all_submitted" ON constraints;
CREATE POLICY "anon_insert_constraints" ON constraints FOR INSERT WITH CHECK (true);
CREATE POLICY "read_after_all_submitted" ON constraints FOR SELECT
  USING (
    (SELECT COUNT(*) FROM constraints c WHERE c.group_id = constraints.group_id) >= 3
  );

-- ─────────────────────────────────────────────
-- Listings
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  area         text    NOT NULL,
  total_rent   integer NOT NULL,
  bhk          integer NOT NULL,
  floor        integer NOT NULL,
  lift         boolean NOT NULL DEFAULT false,
  parking      boolean NOT NULL DEFAULT false,
  bathrooms    integer NOT NULL DEFAULT 1,
  pet_friendly boolean NOT NULL DEFAULT false,
  furnished    boolean NOT NULL DEFAULT false,
  balcony      boolean NOT NULL DEFAULT false,
  gym          boolean NOT NULL DEFAULT false,
  link         text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_listings"   ON listings;
DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_read_listings"   ON listings FOR SELECT USING (true);
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- RPC: count submissions without exposing data
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_constraint_count(p_group_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer FROM constraints WHERE group_id = p_group_id;
$$;

-- ─────────────────────────────────────────────
-- Demo seed
-- ─────────────────────────────────────────────
INSERT INTO groups (id, code) VALUES
  ('00000000-0000-0000-0000-000000000001', 'DEMO01')
ON CONFLICT DO NOTHING;

INSERT INTO constraints (group_id, name, max_rent, excluded_areas, hard, soft) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Riya',
    15000,
    ARRAY['Hadapsar','Hinjewadi'],
    '{"requires_lift": true, "requires_parking": false, "min_bathrooms": 1, "requires_pet_friendly": false, "max_floor_without_lift": 5}',
    '{"prefers_furnished": true, "prefers_balcony": true, "prefers_gym": false, "prefers_lift": true, "prefers_parking": false, "prefers_pet_friendly": false}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Meera',
    12000,
    ARRAY['Kharadi','Wakad'],
    '{"requires_lift": false, "requires_parking": true, "min_bathrooms": 1, "requires_pet_friendly": true, "max_floor_without_lift": 4}',
    '{"prefers_furnished": false, "prefers_balcony": true, "prefers_gym": false, "prefers_lift": false, "prefers_parking": true, "prefers_pet_friendly": true}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Kavita',
    14000,
    ARRAY['Viman Nagar'],
    '{"requires_lift": false, "requires_parking": false, "min_bathrooms": 2, "requires_pet_friendly": false, "max_floor_without_lift": 3}',
    '{"prefers_furnished": true, "prefers_balcony": false, "prefers_gym": true, "prefers_lift": true, "prefers_parking": false, "prefers_pet_friendly": false}'
  )
ON CONFLICT DO NOTHING;

INSERT INTO listings (group_id, area, total_rent, bhk, floor, lift, parking, bathrooms, pet_friendly, furnished, balcony, gym, link) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Baner',       36000, 3, 3, true,  true,  2, true,  true,  true,  false, 'https://example.com/1'),
  ('00000000-0000-0000-0000-000000000001', 'Kothrud',     33000, 2, 2, false, true,  1, true,  false, true,  false, 'https://example.com/2'),
  ('00000000-0000-0000-0000-000000000001', 'Aundh',       38000, 3, 5, true,  false, 2, false, true,  true,  true,  'https://example.com/3'),
  ('00000000-0000-0000-0000-000000000001', 'Viman Nagar', 33000, 2, 4, true,  true,  2, true,  false, false, false, 'https://example.com/4'),
  ('00000000-0000-0000-0000-000000000001', 'Wakad',       30000, 2, 3, false, true,  1, true,  false, false, false, 'https://example.com/5'),
  ('00000000-0000-0000-0000-000000000001', 'Hinjewadi',   31500, 2, 4, true,  true,  2, true,  false, false, false, 'https://example.com/6'),
  ('00000000-0000-0000-0000-000000000001', 'Kharadi',     34500, 3, 3, true,  false, 2, true,  true,  true,  false, 'https://example.com/7'),
  ('00000000-0000-0000-0000-000000000001', 'Baner',       37200, 3, 6, true,  true,  2, true,  true,  false, true,  'https://example.com/8')
ON CONFLICT DO NOTHING;
