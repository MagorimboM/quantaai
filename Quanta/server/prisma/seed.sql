-- ============================================================
-- QUANTA — SQL SEED FILE
-- ============================================================

-- ── CLEAN EXISTING DATA ──────────────────────────────────────

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
  categories,
  company_trade_codes,
  australian_trade_codes,
  temp_file_cache,
  projects,
  companies,
  users
RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (id, email, "firstName", "lastName", phone, "createdAt", "updatedAt")
VALUES (
  'seed-user-001',
  'john.smith@quanta.com.au',
  'John',
  'Smith',
  '0412 345 678',
  NOW(),
  NOW()
);

-- ============================================================
-- COMPANIES
-- ============================================================

INSERT INTO companies (
  id, "userId", name, address, city, state, postcode, country,
  phone, email, "contactName", "contactPhone", "contactEmail",
  "companyType", "isArchived", "createdAt", "updatedAt"
)
VALUES (
  'seed-company-001',
  'seed-user-001',
  'ABC Construction',
  '123 Builder Street',
  'Perth',
  'WA',
  '6000',
  'Australia',
  '08 9000 0000',
  'info@abcconstruction.com.au',
  'Jane Smith',
  '0412 000 000',
  'jane@abcconstruction.com.au',
  'residential',
  false,
  NOW(),
  NOW()
);

-- ============================================================
-- AUSTRALIAN TRADE CODES
-- ============================================================

INSERT INTO australian_trade_codes (id, code, name, division, level, unit, description, "createdAt")
VALUES
  (gen_random_uuid(), '03000', 'Concrete',        'Concrete',   'division', NULL,  'Concrete works',                      NOW()),
  (gen_random_uuid(), '03100', 'Concrete Slab',   'Concrete',   'section',  'm²',  'Reinforced concrete slabs on ground', NOW()),
  (gen_random_uuid(), '04000', 'Masonry',          'Masonry',    'division', NULL,  'Masonry works',                       NOW()),
  (gen_random_uuid(), '04110', '110mm Brick Wall', 'Masonry',    'item',     'm²',  'Single skin clay brick wall 110mm',   NOW()),
  (gen_random_uuid(), '04120', '230mm Brick Wall', 'Masonry',    'item',     'm²',  'Double skin clay brick wall 230mm',   NOW()),
  (gen_random_uuid(), '05000', 'Structural Steel', 'Structural', 'division', NULL,  'Structural steel works',              NOW()),
  (gen_random_uuid(), '05100', 'Steel Lintels',    'Structural', 'item',     'Nr',  'Steel lintels above openings',        NOW());

-- ============================================================
-- CATEGORIES
-- ============================================================ 

INSERT INTO categories (id, "userId", "companyId", name, description, "isDefault", "createdAt", "updatedAt")
VALUES
  ('seed-cat-001', 'seed-user-001', 'seed-company-001', 'Masonry',    'Bricks, blocks and mortar',     true, NOW(), NOW()),
  ('seed-cat-002', 'seed-user-001', 'seed-company-001', 'Concrete',   'Concrete and reinforcement',    true, NOW(), NOW()),
  ('seed-cat-003', 'seed-user-001', 'seed-company-001', 'Structural', 'Steel and structural elements', true, NOW(), NOW()),
  ('seed-cat-004', 'seed-user-001', 'seed-company-001', 'Trade',      'Skilled tradespeople',          true, NOW(), NOW()),
  ('seed-cat-005', 'seed-user-001', 'seed-company-001', 'General',    'General labour and overheads',  true, NOW(), NOW());

-- ============================================================
-- MATERIALS
-- ============================================================

INSERT INTO materials (id, "userId", "companyId", "categoryId", name, description, unit, "createdAt", "updatedAt")
VALUES
  ('seed-mat-001', 'seed-user-001', 'seed-company-001', 'seed-cat-001', 'Clay Brick',        'Standard clay brick 230x110x76mm', 'Nr',  NOW(), NOW()),
  ('seed-mat-002', 'seed-user-001', 'seed-company-001', 'seed-cat-001', 'Cement Mix',        'General purpose mortar mix',       'm³',  NOW(), NOW()),
  ('seed-mat-003', 'seed-user-001', 'seed-company-001', 'seed-cat-001', 'DPC Membrane',      'Damp proof course membrane',       'm',   NOW(), NOW()),
  ('seed-mat-004', 'seed-user-001', 'seed-company-001', 'seed-cat-002', 'Concrete 25MPa',    'Ready mix concrete 25MPa',         'm³',  NOW(), NOW()),
  ('seed-mat-005', 'seed-user-001', 'seed-company-001', 'seed-cat-002', 'Steel Mesh SL72',   'Reinforcement mesh SL72',          'm²',  NOW(), NOW()),
  ('seed-mat-006', 'seed-user-001', 'seed-company-001', 'seed-cat-003', 'Steel Lintel 1200', 'Galvanised steel lintel 1200mm',   'Nr',  NOW(), NOW());

-- ============================================================
-- LABOUR
-- ============================================================

INSERT INTO labour (id, "userId", "companyId", "categoryId", name, description, "labourType", unit, "createdAt", "updatedAt")
VALUES
  ('seed-lab-001', 'seed-user-001', 'seed-company-001', 'seed-cat-004', 'Bricklayer', 'Qualified bricklayer', 'trade',    'hr', NOW(), NOW()),
  ('seed-lab-002', 'seed-user-001', 'seed-company-001', 'seed-cat-005', 'Labourer',   'General labourer',     'labourer', 'hr', NOW(), NOW()),
  ('seed-lab-003', 'seed-user-001', 'seed-company-001', 'seed-cat-004', 'Concretor',  'Qualified concretor',  'trade',    'hr', NOW(), NOW());

-- ============================================================
-- OVERHEADS
-- ============================================================

INSERT INTO overheads (id, "userId", "companyId", "categoryId", name, description, unit, "createdAt", "updatedAt")
VALUES
  ('seed-ovh-001', 'seed-user-001', 'seed-company-001', 'seed-cat-005', 'Scaffolding',   'External scaffolding hire', 'week', NOW(), NOW()),
  ('seed-ovh-002', 'seed-user-001', 'seed-company-001', 'seed-cat-005', 'Concrete Pump', 'Concrete pump hire',        'day',  NOW(), NOW());

-- ============================================================
-- RECIPES
-- ============================================================

INSERT INTO recipes (id, "userId", "companyId", name, description, unit, "isArchived", "createdAt", "updatedAt")
VALUES
  ('seed-rec-001', 'seed-user-001', 'seed-company-001', '110mm Brick Wall',    'Single skin clay brick wall 110mm thick',        'm²', false, NOW(), NOW()),
  ('seed-rec-002', 'seed-user-001', 'seed-company-001', 'Concrete Slab 150mm', 'Reinforced concrete slab 150mm thick on ground', 'm²', false, NOW(), NOW());

-- ── RECIPE MATERIALS ─────────────────────────────────────────

INSERT INTO recipe_materials (id, "userId", "recipeId", "materialId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-001', 60,   'Nr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-002', 0.02, 'm³'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-003', 1,    'm'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-mat-004', 0.15, 'm³'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-mat-005', 1,    'm²');

-- ── RECIPE LABOUR ────────────────────────────────────────────

INSERT INTO recipe_labour (id, "userId", "recipeId", "labourId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-lab-001', 1,   'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-lab-002', 0.5, 'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-lab-003', 0.5, 'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-lab-002', 0.3, 'hr');

-- ── RECIPE OVERHEADS ─────────────────────────────────────────

INSERT INTO recipe_overheads (id, "userId", "recipeId", "overheadId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-ovh-001', 0.1,  'week'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-ovh-002', 0.05, 'day');

-- ============================================================
-- PROJECT
-- ============================================================

INSERT INTO projects (
  id, "userId", "companyId", "projectNumber", name, description,
  type, status, stage, "clientName", "clientEmail", "clientPhone",
  "siteContactName", "siteContactPhone", address, city, state,
  postcode, "startDate", "endDate", "createdAt", "updatedAt"
)
VALUES (
  'seed-proj-001',
  'seed-user-001',
  'seed-company-001',
  'ABC-2026-001',
  'Smith Residence',
  'Single storey residential dwelling',
  'single_storey',
  'in_progress',
  'superstructure',
  'Mr & Mrs Smith',
  'smith@email.com.au',
  '0412 111 222',
  'Bob Smith',
  '0412 333 444',
  '45 Riverside Drive',
  'Subiaco',
  'WA',
  '6008',
  '2026-01-15',
  '2026-08-30',
  NOW(),
  NOW()
);

-- ============================================================
-- TAKEOFF ITEMS
-- ============================================================

INSERT INTO takeoff_items (
  id, "userId", "companyId", "projectId", "recipeId",
  description, measurement, unit, notes, "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'North elevation brick wall',  40.8, 'm²', 'Window openings deducted', NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'South elevation brick wall',  35.2, 'm²', NULL,                       NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Ground floor concrete slab',  85.0, 'm²', 'Including garage slab',    NOW(), NOW());

-- ============================================================
-- DONE
-- ============================================================

SELECT 'Quanta seed complete!' AS status;