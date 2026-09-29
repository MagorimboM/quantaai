# Build Errors to Fix

Build is currently failing: `bun run build` exits with code 2. Two errors are real bugs (marked below), the rest are unused declarations that TypeScript's strict settings treat as build-breaking.

## Real bugs, not just unused code

- [ ] **`recipeBuilder.form.page.tsx(197,11)`** — `error TS2554: Expected 2 arguments, but got 1.` A function call is missing an argument. Find the call at line 197 and check what the function actually expects.
- [ ] **`workspace.page.tsx(93,24)`** — `error TS2741: Property 'companyId' is missing`. An object being passed as a company workspace card is missing `companyId`, which the type requires. Add it to the object being built around line 93.

## quantityTakeoff

- [x] `startAfreshModal.tsx(25,3)` — `showModal` declared but never read
- [x] `quantityTakeOff.page.tsx(102,11)` — `response` declared but never read
- [x] `quantityTakeOff.page.tsx(104,38)` — `key` declared but never read

## recipeBuilder

- [x] `recipeBuilder.form.page.tsx(53,3)` — `term` declared but never read
- [x] `recipeBuilder.form.page.tsx(54,3)` — `categoryId` declared but never read
- [ ] `recipeBuilder.form.page.tsx(69,10)` — `materialsAndCategories` declared but never read
- [ ] `recipeBuilder.form.page.tsx(70,10)` — `recipeCategories` declared but never read
- [ ] `recipeBuilder.form.page.tsx(71,17)` — `setQuery` declared but never read
- [ ] `recipeBuilder.form.page.tsx(89,30)` — `setMaterialCategories` declared but never read

## recipeLibrary

- [ ] `recipeActions.tsx(38,32)` — all destructured elements unused
- [ ] `recipeActions.tsx(50,31)` — all destructured elements unused
- [ ] `recipeCategory.tsx(3,7)` — `ALL_CATEGORIES_ID` declared but never read
- [ ] `recipeForm.tsx(34,3)` — `setRecipeListState` declared but never read (this one was already flagged in the main TODO list as safe to remove)

## settings

- [ ] `settings/api/api.tsx(3,6)` — `UpdateCompanyRequest` declared but never used
- [ ] `companyTeamMembersList.tsx(12,6)` — `Documents` declared but never used

## workspaceSwitcher

- [ ] `companyWorkspacesCard.tsx(1,1)` — all imports in the import declaration are unused
- [ ] `personalCard.tsx(4,1)` — all imports in the import declaration are unused
- [ ] `workspace.page.tsx(9,3)` — `postNewWorkspace` declared but never read
