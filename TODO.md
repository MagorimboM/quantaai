# Quanta — Outstanding TODO List

## Authentication (root cause of most items below)
- [ ] Every controller still uses a hardcoded `userId` (`'seed-user-100'`, `'seed-user-001'`) instead of a verified session
- [ ] `companyId` still hardcoded client-side in multiple places (`ProjectsPage`, `RecipeBuilderFormPage`) instead of pulled from a real workspace context

## Workspace Switcher
- [ ] Check `localStorage` for a workspace id on load → redirect to dashboard if present
- [ ] Show "create personal workspace" flow if none exists
- [ ] Wire actual navigation into a workspace on click
- [ ] `CreateCompanyWorkspaceForm`: import the real API
- [ ] `CreateCompanyWorkspaceForm`: wire submit to the backend — form doesn't create anything yet

## Recipe Builder
- [ ] `recipeCode` has no real column on `Recipe` — currently a dead field
- [ ] `unitMeasureId` has no backing `UnitMeasure` table
- [ ] `searchMaterialsPlaceholder` is a placeholder, not a real API call
- [ ] `getSiteConditionsPlaceholder` is a placeholder, not a real API call

## Recipe Library
- [ ] "Show Archived" button does nothing yet
- [ ] Edit recipe — not implemented
- [ ] Archive recipe — not implemented
- [ ] Move the contracts to the contracts folders
- [ ] No update/delete recipe API calls exist yet

## Bill of Quantities
- [ ] **Recipe quantity calculations** — the core "John inputs ONE measurement, app calculates everything" promise from the schema's own top comment has never actually been implemented. Needs: `RecipeMaterial.quantity × TakeoffItem.measurement` (same logic for labour/overheads), calculated on the frontend from backend-supplied recipe + ingredient data, aggregated across all line items sharing a recipe, surfaced via the currently-dormant "Preview Quantities" button (has an icon and a `disabled` state, but no `onClick` at all)
- [ ] `saveBillOfQuants` / `completeTakeOff` still hardcode `companyId: "seed-company-001"`
- [ ] `LineItem` measurement input uses `placeholder` instead of a real controlled `value` — not actually editable yet

## Documents / Files
- [ ] `FileModalComp`: `DUMMY_DATA` object still hardcodes project/company/document ids
- [ ] `FileModalComp`: double-check component orchestrator
- [ ] `FileModalComp`: rename the `document.document` data structure
- [ ] `ViewFileModalComp`: deleting a file doesn't remove it from the parent's list (no updater callback wired through)
- [ ] `UploadModalComp`: hardcoded ids in `uploadFiles`
- [ ] `UploadModalComp`: no loading UI while an upload is in flight

## Projects
- [ ] Implement "View Library"
- [ ] Implement "View Quantities" (flagged as the big one)
- [ ] `ListOfProjects`: create real contracts — still using inline/`any` types

## Schema-level
- [ ] Nothing writes to `AuditLog` anywhere — stays empty until mutations insert rows
- [ ] `recipeTags` hardcoded to `[]` everywhere — no real schema backing
- [ ] Docker Compose mounts individual migration files by exact filename — fragile; switch to `bunx prisma migrate deploy` on container startup

## Scale / production hardening
- [ ] No database indexes beyond primary keys — every `companyId`/`userId`/`categoryId` filter is a full table scan today
- [ ] Default Prisma connection pool, no PgBouncer
- [ ] Single server replica, no load balancer path
- [ ] No caching layer for rarely-changing data (categories, recipe types)
- [ ] No rate limiting anywhere
- [ ] Only the queries touched during our sessions were audited for fan-out/N+1 — the rest of the app hasn't been swept yet