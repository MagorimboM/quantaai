-- ============================================================
-- QUANTA — SQL SEED FILE
-- Multiple companies, each owned by a distinct user.
-- Each company has: categories, materials, labour, overheads,
-- recipes, and TWO projects (one completed, one incomplete).
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
  company_team_members,
  projects,
  companies,
  users
RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS  (one user per company)
-- ============================================================

INSERT INTO users (id, email, "firstName", "lastName", phone, "createdAt", "updatedAt")
VALUES
  ('seed-user-001', 'john.smith@abcconstruction.com.au', 'John',  'Smith',  '0412 345 678', NOW(), NOW()),
  ('seed-user-002', 'tom.reeves@xyzbuilders.com.au',      'Tom',   'Reeves', '0413 555 666', NOW(), NOW()),
  ('seed-user-003', 'lisa.chen@coastalconcrete.com.au',   'Lisa',  'Chen',   '0414 222 999', NOW(), NOW());

-- ============================================================
-- COMPANIES  (one company per user)
-- ============================================================

INSERT INTO companies (
  id, "userId", name, address, city, state, postcode, country,
  phone, email, "contactName", "contactPhone", "contactEmail",
  "companyType", "isArchived", "createdAt", "updatedAt"
)
VALUES
  ('seed-company-001', 'seed-user-001', 'ABC Construction',   '123 Builder Street', 'Perth',    'WA', '6000', 'Australia', '08 9000 0000', 'info@abcconstruction.com.au', 'Jane Smith',  '0412 000 000', 'jane@abcconstruction.com.au', 'residential', false, NOW(), NOW()),
  ('seed-company-002', 'seed-user-002', 'XYZ Builders',       '88 Industrial Ave',  'Perth',    'WA', '6000', 'Australia', '08 9111 2222', 'info@xyzbuilders.com.au',     'Tom Reeves',  '0413 555 666', 'tom@xyzbuilders.com.au',      'commercial',  false, NOW(), NOW()),
  ('seed-company-003', 'seed-user-003', 'Coastal Concrete Co', '5 Foreshore Rd',    'Fremantle','WA', '6160', 'Australia', '08 9222 3333', 'info@coastalconcrete.com.au', 'Lisa Chen',   '0414 222 999', 'lisa@coastalconcrete.com.au', 'concrete',    false, NOW(), NOW());

-- ============================================================
-- COMPANY TEAM MEMBERS
-- ============================================================

INSERT INTO company_team_members (
  id, "userId", "companyId", name, "lastName", email, "phoneNumber",
  position, "createdAt", "updatedAt"
)
VALUES
  ('seed-team-001', 'seed-user-001', 'seed-company-001', 'Jane',  'Smith',  'jane@abcconstruction.com.au',  '0412 000 000', 'Office Manager',  NOW(), NOW()),
  ('seed-team-002', 'seed-user-001', 'seed-company-001', 'Mark',  'Taylor', 'mark@abcconstruction.com.au',  '0412 111 333', 'Site Supervisor', NOW(), NOW()),
  ('seed-team-003', 'seed-user-002', 'seed-company-002', 'Nina',  'Osei',   'nina@xyzbuilders.com.au',      '0413 444 555', 'Estimator',        NOW(), NOW()),
  ('seed-team-004', 'seed-user-003', 'seed-company-003', 'Carlos','Diaz',   'carlos@coastalconcrete.com.au','0414 666 777', 'Site Supervisor',  NOW(), NOW());

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
-- CATEGORIES
-- ============================================================

INSERT INTO categories (id, "userId", "companyId", name, description, "isDefault", "createdAt", "updatedAt")
VALUES
  -- ABC Construction (residential)
  ('seed-cat-001', 'seed-user-001', 'seed-company-001', 'Masonry',  'Bricks, blocks and mortar',    true, NOW(), NOW()),
  ('seed-cat-002', 'seed-user-001', 'seed-company-001', 'Concrete', 'Concrete and reinforcement',   true, NOW(), NOW()),
  ('seed-cat-003', 'seed-user-001', 'seed-company-001', 'General',  'General labour and overheads', true, NOW(), NOW()),
  -- XYZ Builders (commercial roofing)
  ('seed-cat-004', 'seed-user-002', 'seed-company-002', 'Roofing',  'Roofing materials and labour',  true, NOW(), NOW()),
  ('seed-cat-005', 'seed-user-002', 'seed-company-002', 'General',  'General labour and overheads',  true, NOW(), NOW()),
  -- Coastal Concrete Co (concrete specialists)
  ('seed-cat-006', 'seed-user-003', 'seed-company-003', 'Concrete', 'Concrete and reinforcement',    true, NOW(), NOW()),
  ('seed-cat-007', 'seed-user-003', 'seed-company-003', 'General',  'General labour and overheads',  true, NOW(), NOW());

-- ============================================================
-- MATERIALS
-- ============================================================

INSERT INTO materials (id, "userId", "companyId", "categoryId", name, description, unit, "createdAt", "updatedAt")
VALUES
  -- ABC Construction
  ('seed-mat-001', 'seed-user-001', 'seed-company-001', 'seed-cat-001', 'Clay Brick',     'Standard clay brick 230x110x76mm', 'Nr', NOW(), NOW()),
  ('seed-mat-002', 'seed-user-001', 'seed-company-001', 'seed-cat-001', 'Cement Mix',     'General purpose mortar mix',       'm³', NOW(), NOW()),
  ('seed-mat-003', 'seed-user-001', 'seed-company-001', 'seed-cat-002', 'Concrete 25MPa', 'Ready mix concrete 25MPa',         'm³', NOW(), NOW()),
  -- XYZ Builders
  ('seed-mat-004', 'seed-user-002', 'seed-company-002', 'seed-cat-004', 'Colorbond Sheet', 'Corrugated colorbond roofing sheet', 'm²', NOW(), NOW()),
  ('seed-mat-005', 'seed-user-002', 'seed-company-002', 'seed-cat-004', 'Roof Batten',      'Timber roof batten',                 'm',  NOW(), NOW()),
  -- Coastal Concrete Co
  ('seed-mat-006', 'seed-user-003', 'seed-company-003', 'seed-cat-006', 'Concrete 32MPa', 'Ready mix concrete 32MPa',   'm³', NOW(), NOW()),
  ('seed-mat-007', 'seed-user-003', 'seed-company-003', 'seed-cat-006', 'Steel Mesh SL82', 'Reinforcement mesh SL82',    'm²', NOW(), NOW());

-- ============================================================
-- LABOUR
-- ============================================================

INSERT INTO labour (id, "userId", "companyId", "categoryId", name, description, "labourType", unit, "createdAt", "updatedAt")
VALUES
  -- ABC Construction
  ('seed-lab-001', 'seed-user-001', 'seed-company-001', 'seed-cat-001', 'Bricklayer', 'Qualified bricklayer', 'trade',    'hr', NOW(), NOW()),
  ('seed-lab-002', 'seed-user-001', 'seed-company-001', 'seed-cat-003', 'Labourer',   'General labourer',     'labourer', 'hr', NOW(), NOW()),
  -- XYZ Builders
  ('seed-lab-003', 'seed-user-002', 'seed-company-002', 'seed-cat-004', 'Roofer',   'Qualified roofer', 'trade',    'hr', NOW(), NOW()),
  ('seed-lab-004', 'seed-user-002', 'seed-company-002', 'seed-cat-005', 'Labourer', 'General labourer',  'labourer', 'hr', NOW(), NOW()),
  -- Coastal Concrete Co
  ('seed-lab-005', 'seed-user-003', 'seed-company-003', 'seed-cat-006', 'Concretor', 'Qualified concretor', 'trade',    'hr', NOW(), NOW()),
  ('seed-lab-006', 'seed-user-003', 'seed-company-003', 'seed-cat-007', 'Labourer',  'General labourer',    'labourer', 'hr', NOW(), NOW());

-- ============================================================
-- OVERHEADS
-- ============================================================

INSERT INTO overheads (id, "userId", "companyId", "categoryId", name, description, unit, "createdAt", "updatedAt")
VALUES
  ('seed-ovh-001', 'seed-user-001', 'seed-company-001', 'seed-cat-003', 'Scaffolding',   'External scaffolding hire', 'week', NOW(), NOW()),
  ('seed-ovh-002', 'seed-user-002', 'seed-company-002', 'seed-cat-005', 'Crane Hire',    'Mobile crane hire',         'day',  NOW(), NOW()),
  ('seed-ovh-003', 'seed-user-003', 'seed-company-003', 'seed-cat-007', 'Concrete Pump', 'Concrete pump hire',        'day',  NOW(), NOW());

-- ============================================================
-- RECIPES
-- ============================================================

INSERT INTO recipes (id, "userId", "companyId", name, description, unit, "isArchived", "createdAt", "updatedAt")
VALUES
  ('seed-rec-001', 'seed-user-001', 'seed-company-001', '110mm Brick Wall',    'Single skin clay brick wall 110mm thick',        'm²', false, NOW(), NOW()),
  ('seed-rec-002', 'seed-user-001', 'seed-company-001', 'Concrete Slab 150mm', 'Reinforced concrete slab 150mm thick on ground', 'm²', false, NOW(), NOW()),
  ('seed-rec-003', 'seed-user-002', 'seed-company-002', 'Colorbond Roof',      'Standard colorbond roof installation',           'm²', false, NOW(), NOW()),
  ('seed-rec-004', 'seed-user-003', 'seed-company-003', 'Slab on Ground 32MPa','High-strength slab on ground, 32MPa mix',        'm²', false, NOW(), NOW());

-- ── RECIPE MATERIALS ─────────────────────────────────────────

INSERT INTO recipe_materials (id, "userId", "recipeId", "materialId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-001', 60,   'Nr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-mat-002', 0.02, 'm³'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-mat-003', 0.15, 'm³'),
  (gen_random_uuid(), 'seed-user-002', 'seed-rec-003', 'seed-mat-004', 1,    'm²'),
  (gen_random_uuid(), 'seed-user-002', 'seed-rec-003', 'seed-mat-005', 2,    'm'),
  (gen_random_uuid(), 'seed-user-003', 'seed-rec-004', 'seed-mat-006', 0.18, 'm³'),
  (gen_random_uuid(), 'seed-user-003', 'seed-rec-004', 'seed-mat-007', 1,    'm²');

-- ── RECIPE LABOUR ────────────────────────────────────────────

INSERT INTO recipe_labour (id, "userId", "recipeId", "labourId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-lab-001', 1,   'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-lab-002', 0.5, 'hr'),
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-002', 'seed-lab-002', 0.4, 'hr'),
  (gen_random_uuid(), 'seed-user-002', 'seed-rec-003', 'seed-lab-003', 0.4, 'hr'),
  (gen_random_uuid(), 'seed-user-002', 'seed-rec-003', 'seed-lab-004', 0.2, 'hr'),
  (gen_random_uuid(), 'seed-user-003', 'seed-rec-004', 'seed-lab-005', 0.6, 'hr'),
  (gen_random_uuid(), 'seed-user-003', 'seed-rec-004', 'seed-lab-006', 0.3, 'hr');

-- ── RECIPE OVERHEADS ─────────────────────────────────────────

INSERT INTO recipe_overheads (id, "userId", "recipeId", "overheadId", quantity, unit)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-rec-001', 'seed-ovh-001', 0.1,  'week'),
  (gen_random_uuid(), 'seed-user-002', 'seed-rec-003', 'seed-ovh-002', 0.05, 'day'),
  (gen_random_uuid(), 'seed-user-003', 'seed-rec-004', 'seed-ovh-003', 0.08, 'day');

-- ============================================================
-- PROJECTS
-- Each company: one COMPLETED project + one INCOMPLETE project.
-- ============================================================

INSERT INTO projects (
  id, "userId", "companyId", "projectNumber", name, description,
  type, status, stage, "clientName", "clientEmail", "clientPhone",
  "siteContactName", "siteContactPhone", address, city, state,
  postcode, "startDate", "endDate", completed, "completedAt",
  "createdAt", "updatedAt"
)
VALUES
  -- ABC Construction — incomplete
  (
    'seed-proj-001', 'seed-user-001', 'seed-company-001', 'ABC-2026-001', 'Smith Residence',
    'Single storey residential dwelling', 'single_storey', 'in_progress', 'superstructure',
    'Mr & Mrs Smith', 'smith@email.com.au', '0412 111 222',
    'Bob Smith', '0412 333 444', '45 Riverside Drive', 'Subiaco', 'WA', '6008',
    '2026-01-15', '2026-08-30', false, NULL, NOW(), NOW()
  ),
  -- ABC Construction — completed
  (
    'seed-proj-002', 'seed-user-001', 'seed-company-001', 'ABC-2025-014', 'Turner Extension',
    'Rear extension and renovation', 'renovation', 'completed', 'closed',
    'Mrs Turner', 'turner@email.com.au', '0412 555 111',
    'Bob Smith', '0412 333 444', '7 Hawthorn Street', 'Nedlands', 'WA', '6009',
    '2025-05-01', '2025-10-12', true, '2025-10-12T15:30:00.000Z', NOW(), NOW()
  ),
  -- XYZ Builders — incomplete
  (
    'seed-proj-003', 'seed-user-002', 'seed-company-002', 'XYZ-2026-002', 'Malaga Industrial Shed',
    'New build steel-frame industrial shed', 'commercial', 'in_progress', 'roofing',
    'Malaga Storage Pty Ltd', 'ops@malagastorage.com.au', '0413 222 333',
    'Nina Osei', '0413 444 555', '20 Enterprise Way', 'Malaga', 'WA', '6090',
    '2026-02-01', '2026-09-15', false, NULL, NOW(), NOW()
  ),
  -- XYZ Builders — completed
  (
    'seed-proj-004', 'seed-user-002', 'seed-company-002', 'XYZ-2025-014', 'Warehouse Reroof',
    'Full reroof of commercial warehouse', 'commercial', 'completed', 'closed',
    'XYZ Logistics Pty Ltd', 'ops@xyzlogistics.com.au', '0412 777 888',
    'Dave Cole', '0412 999 000', '12 Freight Rd', 'Welshpool', 'WA', '6106',
    '2025-09-01', '2025-11-20', true, '2025-11-20T16:00:00.000Z', NOW(), NOW()
  ),
  -- Coastal Concrete Co — incomplete
  (
    'seed-proj-005', 'seed-user-003', 'seed-company-003', 'CCC-2026-003', 'Fremantle Boardwalk Slab',
    'Concrete slab for foreshore boardwalk extension', 'civil', 'in_progress', 'pouring',
    'City of Fremantle', 'works@fremantle.wa.gov.au', '08 9432 9999',
    'Carlos Diaz', '0414 666 777', 'Marine Terrace', 'Fremantle', 'WA', '6160',
    '2026-03-01', '2026-07-01', false, NULL, NOW(), NOW()
  ),
  -- Coastal Concrete Co — completed
  (
    'seed-proj-006', 'seed-user-003', 'seed-company-003', 'CCC-2025-009', 'Rockingham Driveway',
    'Residential driveway and carport slab', 'residential', 'completed', 'closed',
    'Mr Alvarez', 'alvarez@email.com.au', '0414 888 111',
    'Carlos Diaz', '0414 666 777', '9 Shoalwater Ave', 'Rockingham', 'WA', '6168',
    '2025-06-10', '2025-06-28', true, '2025-06-28T13:00:00.000Z', NOW(), NOW()
  );

-- ============================================================
-- TAKEOFF ITEMS  (link recipes to projects)
-- ============================================================

INSERT INTO takeoff_items (
  id, "userId", "companyId", "projectId", "recipeId",
  description, measurement, unit, notes, "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-001', 'North elevation brick wall', 40.8, 'm²', 'Window openings deducted', NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-001', 'seed-company-001', 'seed-proj-001', 'seed-rec-002', 'Ground floor slab',          85.0, 'm²', NULL,                       NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-001', 'seed-company-001', 'seed-proj-002', 'seed-rec-002', 'Extension floor slab',       28.5, 'm²', NULL,                       NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-002', 'seed-company-002', 'seed-proj-003', 'seed-rec-003', 'Main shed roof',            420.0, 'm²', NULL,                       NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-002', 'seed-company-002', 'seed-proj-004', 'seed-rec-003', 'Full warehouse reroof',     610.0, 'm²', 'Removed old asbestos sheet', NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-003', 'seed-company-003', 'seed-proj-005', 'seed-rec-004', 'Boardwalk slab section 1',  120.0, 'm²', NULL,                       NOW(), NOW()),
  (gen_random_uuid(), 'seed-user-003', 'seed-company-003', 'seed-proj-006', 'seed-rec-004', 'Driveway + carport slab',    32.0, 'm²', NULL,                       NOW(), NOW());

-- ============================================================
-- DONE
-- ============================================================

SELECT 'Quanta seed complete!' AS status;