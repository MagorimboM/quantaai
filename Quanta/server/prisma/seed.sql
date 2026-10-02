TRUNCATE TABLE
  chat_messages,
  document_embeddings,
  documents,
  audit_logs,
  takeoff_items,
  recipe_overheads,
  recipe_labour,
  recipe_materials,
  recipes,
  overheads,
  labour,
  materials,
  site_conditions,
  categories,
  company_trade_codes,
  australian_trade_codes,
  temp_file_cache,
  company_team_members,
  projects,
  workspaces,
  companies,
  users
RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS
-- Linked to a real Clerk account (clerkId set) so logging in
-- as this person immediately shows this seed data.
-- ============================================================

INSERT INTO users (id, "clerkId", email, "firstName", "lastName", phone, "createdAt", "updatedAt")
VALUES
  ('seed-user-001', 'user_3K3xuh2kmIlFegNzSlv5y6Qyyvs', 'john.smith@abcconstruction.com.au', 'John',  'Smith',  '0412 345 678', NOW(), NOW());

-- ============================================================
-- COMPANIES
-- ============================================================

INSERT INTO companies (
  id, "userId", name, address, city, state, postcode, country,
  phone, email, "contactName", "contactPhone", "contactEmail",
  "companyType", "isArchived", "createdAt", "updatedAt"
)
VALUES
  ('seed-company-001', 'seed-user-001', 'ABC Construction',   '123 Builder Street', 'Perth',    'WA', '6000', 'Australia', '08 9000 0000', 'info@abcconstruction.com.au', 'Jane Smith',  '0412 000 000', 'jane@abcconstruction.com.au', 'residential', false, NOW(), NOW());

-- ============================================================
-- WORKSPACES  (one workspace for this company -- Workspace
-- sits under Company only; nothing else references workspaceId)
-- ============================================================

INSERT INTO workspaces (id, "userId", "companyId", name, description, "isArchived", "createdAt", "updatedAt")
VALUES
  ('seed-ws-001', 'seed-user-001', 'seed-company-001', 'ABC Construction — Main Workspace',    'Default workspace for ABC Construction jobs',   false, NOW(), NOW());

-- ============================================================
-- COMPANY TEAM MEMBERS
-- ============================================================

INSERT INTO company_team_members (
  id, "userId", "companyId", name, "lastName", email, "phoneNumber",
  position, "createdAt", "updatedAt"
)
VALUES
  ('seed-team-001', 'seed-user-001', 'seed-company-001', 'Jane',  'Smith',  'jane@abcconstruction.com.au',  '0412 000 000', 'Office Manager',  NOW(), NOW()),
  ('seed-team-002', 'seed-user-001', 'seed-company-001', 'Mark',  'Taylor', 'mark@abcconstruction.com.au',  '0412 111 333', 'Site Supervisor', NOW(), NOW());

-- ============================================================
-- AUSTRALIAN TRADE CODES  (global, shared master list)
-- ============================================================

INSERT INTO australian_trade_codes (id, code, name, division, level, unit, description, "createdAt")
VALUES
  (gen_random_uuid(), '03000', 'Concrete',         'Concrete',   'division', NULL, 'Concrete works',                      NOW()),
  (gen_random_uuid(), '03100', 'Concrete Slab',    'Concrete',   'section',  'm²', 'Reinforced concrete slabs on ground', NOW()),
  (gen_random_uuid(), '04000', 'Masonry',          'Masonry',    'division', NULL, 'Masonry works',                       NOW()),
  (gen_random_uuid(), '04110', '110mm Brick Wall', 'Masonry',    'item',     'm²', 'Single skin clay brick wall 110mm',   NOW()),
  (gen_random_uuid(), '06000', 'Roofing',          'Roofing',    'division', NULL, 'Roofing works',                       NOW()),
  (gen_random_uuid(), '06100', 'Metal Roof Sheet', 'Roofing',    'item',     'm²', 'Corrugated metal roof sheeting',      NOW());

-- ============================================================
-- SITE CONDITIONS
-- Global lookup -- shared across all companies. Null on a
-- material/labour/overhead/recipe means general purpose.
-- ============================================================

INSERT INTO site_conditions (id, name, description, "createdAt")
VALUES
  ('seed-site-001', 'Muddy',   'Soft, waterlogged or unstable ground requiring stabilisation', NOW()),
  ('seed-site-002', 'Sandy',   'Loose, free-draining sandy ground',                             NOW()),
  ('seed-site-003', 'Coastal', 'Near-shore, salt-exposed conditions',                           NOW());

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (id, "userId", "companyId", name, description, "isDefault", "createdAt", "updatedAt")
VALUES
  ('seed-cat-001', 'seed-user-001', 'seed-company-001', 'Masonry',  'Bricks, blocks and mortar',    true, NOW(), NOW()),
  ('seed-cat-002', 'seed-user-001', 'seed-company-001', 'Concrete', 'Concrete and reinforcement',   true, NOW(), NOW()),
  ('seed-cat-003', 'seed-user-001', 'seed-company-001', 'General',  'General labour and overheads', true, NOW(), NOW());

-- ============================================================
-- MATERIALS
-- All general-purpose (siteConditionId NULL).
-- ============================================================

INSERT INTO materials (id, "userId", "companyId", "categoryId", "siteConditionId", name, description, unit, "createdAt", "updatedAt")
VALUES
  ('seed-mat-001', 'seed-user-001', 'seed-company-001', 'seed-cat-001', NULL, 'Clay Brick',     'Standard clay brick 230x110x76mm', 'Nr', NOW(), NOW()),
  ('seed-mat-002', 'seed-user-001', 'seed-company-001', 'seed-cat-001', NULL, 'Cement Mix',     'General purpose mortar mix',       'm³', NOW(), NOW()),
  ('seed-mat-003', 'seed-user-001', 'seed-company-001', 'seed-cat-002', NULL, 'Concrete 25MPa', 'Ready mix concrete 25MPa',         'm³', NOW(), NOW());

-- ============================================================
-- LABOUR
-- ============================================================

INSERT INTO labour (id, "userId", "companyId", "categoryId", "siteConditionId", name, description, "labourType", unit, "createdAt", "updatedAt")
VALUES
  ('seed-lab-001', 'seed-user-001', 'seed-company-001', 'seed-cat-001', NULL, 'Bricklayer', 'Qualified bricklayer', 'trade',    'hr', NOW(), NOW()),
  ('seed-lab-002', 'seed-user-001', 'seed-company-001', 'seed-cat-003', NULL, 'Labourer',   'General labourer',     'labourer', 'hr', NOW(), NOW());

-- ============================================================
-- OVERHEADS
-- ============================================================

INSERT INTO overheads (id, "userId", "companyId", "categoryId", "siteConditionId", name, description, unit, "createdAt", "updatedAt")
VALUES
  ('seed-ovh-001', 'seed-user-001', 'seed-company-001', 'seed-cat-003', NULL, 'Scaffolding',   'External scaffolding hire', 'week', NOW(), NOW());

-- ============================================================
-- RECIPES
-- ============================================================

INSERT INTO recipes (id, "userId", "companyId", "categoryId", "siteConditionId", name, description, unit, "isArchived", "createdAt", "updatedAt")
VALUES
  ('seed-rec-001', 'seed-user-001', 'seed-company-001', 'seed-cat-001', NULL, '110mm Brick Wall',    'Single skin clay brick wall 110mm thick',        'm²', false, NOW(), NOW()),
  ('seed-rec-002', 'seed-user-001', 'seed-company-001', 'seed-cat-002', NULL, 'Concrete Slab 150mm', 'Reinforced concrete slab 150mm thick on ground', 'm²', false, NOW(), NOW());

-- ── RECIPE MATERIALS ─────────────────────────────────────────

INSERT INTO recipe_materials (id, "userId", "recipeId", "materialId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-001', 60,   'Nr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-002', 0.02, 'm³'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-mat-003', 0.15, 'm³');

-- ── RECIPE LABOUR ────────────────────────────────────────────

INSERT INTO recipe_labour (id, "userId", "recipeId", "labourId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-lab-001', 1,   'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-lab-002', 0.5, 'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-lab-002', 0.4, 'hr');

-- ── RECIPE OVERHEADS ─────────────────────────────────────────

INSERT INTO recipe_overheads (id, "userId", "recipeId", "overheadId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-ovh-001', 0.1,  'week');

-- ============================================================
-- PROJECTS
-- One COMPLETED project + one INCOMPLETE project.
-- ============================================================

INSERT INTO projects (
  id, "userId", "companyId", "projectNumber", name, description,
  type, status, stage, "clientName", "clientEmail", "clientPhone",
  "siteContactName", "siteContactPhone", address, city, state,
  postcode, "startDate", "endDate", completed, "completedAt",
  "createdAt", "updatedAt"
)
VALUES
  -- incomplete
  (
    'seed-proj-001', 'seed-user-001', 'seed-company-001', 'ABC-2026-001', 'Smith Residence',
    'Single storey residential dwelling', 'single_storey', 'in_progress', 'superstructure',
    'Mr & Mrs Smith', 'smith@email.com.au', '0412 111 222',
    'Bob Smith', '0412 333 444', '45 Riverside Drive', 'Subiaco', 'WA', '6008',
    '2026-01-15', '2026-08-30', false, NULL, NOW(), NOW()
  ),
  -- completed
  (
    'seed-proj-002', 'seed-user-001', 'seed-company-001', 'ABC-2025-014', 'Turner Extension',
    'Rear extension and renovation', 'renovation', 'completed', 'closed',
    'Mrs Turner', 'turner@email.com.au', '0412 555 111',
    'Bob Smith', '0412 333 444', '7 Hawthorn Street', 'Nedlands', 'WA', '6009',
    '2025-05-01', '2025-10-12', true, '2025-10-12T15:30:00.000Z', NOW(), NOW()
  );

-- ============================================================
-- TAKEOFF ITEMS  (link recipes to projects)
-- Deterministic IDs (instead of gen_random_uuid()) so e2e tests
-- can reference specific rows directly.
-- ============================================================

INSERT INTO takeoff_items (
  id, "userId", "companyId", "projectId", "recipeId",
  description, measurement, unit, notes, "createdAt", "updatedAt"
)
VALUES
  ('seed-takeoff-101', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'North elevation brick wall',    40.8, 'm²', 'Window openings deducted',      NOW(), NOW()),
  ('seed-takeoff-102', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'South elevation brick wall',    35.2, 'm²', NULL,                            NOW(), NOW()),
  ('seed-takeoff-103', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'East elevation brick wall',     41.5, 'm²', 'Door opening deducted',         NOW(), NOW()),
  ('seed-takeoff-104', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'West elevation brick wall',     38.2, 'm²', NULL,                            NOW(), NOW()),
  ('seed-takeoff-105', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'North elevation brick wall',    40.8, 'm²', 'Window openings deducted',      NOW(), NOW()),
  ('seed-takeoff-106', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Ground floor concrete slab',    85.0, 'm²', 'Including garage slab',         NOW(), NOW()),
  ('seed-takeoff-107', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Garage slab',                   24.0, 'm²', NULL,                            NOW(), NOW()),
  ('seed-takeoff-108', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Front porch slab',               9.8, 'm²', 'Includes step-down to path',    NOW(), NOW()),
  ('seed-takeoff-109', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Ground floor concrete slab',    85.0, 'm²', 'Including garage slab',         NOW(), NOW()),
  ('seed-takeoff-110', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'Rear boundary wall',            52.0, 'm²', NULL,                            NOW(), NOW()),
  ('seed-takeoff-111', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Rear patio slab',               33.5, 'm²', 'Slight fall to garden for drainage', NOW(), NOW()),
  ('seed-takeoff-112', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'Side boundary wall',            29.0, 'm²', NULL,                            NOW(), NOW()),
  ('seed-takeoff-113', 'seed-user-001', 'seed-company-001', 'seed-proj-001', NULL,           'Site clearance and levelling', 120.0, 'm²', 'No recipe assigned yet — pending scope confirmation', NOW(), NOW()),
  ('seed-takeoff-114', 'seed-user-001', 'seed-company-001', 'seed-proj-001', NULL,           'Fence removal and disposal',    18.0, 'm',  'No recipe assigned yet',        NOW(), NOW()),
  ('seed-takeoff-115', 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Ground floor concrete slab',    85.0, 'm²', 'Including garage slab',         NOW(), NOW());

SELECT 'Quanta seed complete!' AS status;