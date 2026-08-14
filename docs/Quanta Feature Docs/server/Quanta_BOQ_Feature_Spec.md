# Bill of Quantities — Server Spec

## Overview

This feature lets a company manage projects, each with a Bill of Quantities (BoQ) made up of recipes (e.g. "Double Leaf Cavity Wall"). Each recipe has a list of ingredients (materials), and each ingredient has a rate used to calculate quantities.

A shared, company-wide Recipe Library lets users search for and reuse existing recipes across projects.

---

## 1. List Projects

- **Method:** GET
- **Endpoint:** `/companies/{companyId}/projects`
- **Purpose:** Get all projects belonging to a company.
- **Request:** `companyId` passed in the URL path. No body.

**Response:**
```json
{
  "projects": [
    {
      "projectId": "098aq2134c6f54d54",
      "companyId": "134ahwehaandg12890",
      "projectName": "Harbour View Apartment",
      "projectType": "Metro Housing",
      "recipeCount": 48,
      "lastActivityAt": "2025-01-01T14:32:00Z"
    }
  ]
}
```

**What's happening:** This is the entry point for the Projects list page. The frontend sends the logged-in user's company ID, and the backend looks up every project tied to that company and returns them as a flat list. Nothing is filtered or paginated here in the current draft — worth deciding later whether large companies need pagination or sorting (e.g. most recently active first).

---

## 2. Get Bill of Quantities

- **Method:** GET
- **Endpoint:** `/projects/{projectId}/bill-of-quantities`
- **Purpose:** Get the full Bill of Quantities for one project.
- **Request:** `projectId` passed in the URL path. No body.

**Response:**
```json
{
  "projectId": "q123a3a23a3",
  "recipes": [
    {
      "recipeId": "123zwew2q4srtdtyrf6889000",
      "category": "Walls",
      "recipeName": "Double Leaf Cavity Wall",
      "recipeUnitMeasure": "m2",
      "quantity": 833,
      "ingredients": [
        { "name": "Cement", "unit": "kg/m2", "rate": 0.001 },
        { "name": "Sand", "unit": "m2/m3", "rate": 0.0003 }
      ]
    }
  ]
}
```

Each recipe here carries a `quantity`, since it's attached to a specific project. Each ingredient has `name`, `unit`, and `rate`. This is the **BoQ Line Item** shape — see Web Spec's Data Structures section, where it's identical field-for-field.

**What's happening:** When a user opens a specific project's Bill of Quantities page, the frontend sends just that project's ID, and the backend returns every recipe currently attached to it. This is the "read" side of the BoQ — it populates the table the user sees and edits (Web Spec, Section 2). Note this pulls project-level recipes (with `quantity`), not library-level ones — the two are different objects even though they share most fields.

---

## 3. Add or Update Recipes on a Project

- **Method:** POST
- **Endpoint:** `/projects/{projectId}/bill-of-quantities`
- **Purpose:** Save new recipes to a project's BoQ, or update existing ones. If a recipe with a matching `recipeId` already exists on the project, it's updated rather than duplicated.

**Request:** `projectId` in the URL path (not repeated in the body).

```json
{
  "recipes": [
    {
      "recipeId": "123zwew2q4srtdtyrf6889000",
      "category": "Walls",
      "recipeName": "Double Leaf Cavity Wall",
      "recipeUnitMeasure": "m2",
      "quantity": 833,
      "ingredients": [
        { "name": "Cement", "unit": "kg/m2", "rate": 0.001 },
        { "name": "Sand", "unit": "m2/m3", "rate": 0.0003 }
      ]
    }
  ]
}
```

**Response:**
```json
{ "success": true }
```

**What's happening:** This single endpoint is the workhorse of the feature — it's what fires when a user adds a recipe to their project from the Recipe Library, edits a quantity, auto-saves, manually saves, saves-before-preview, or completes a takeoff (Web Spec, Sections 1, 2, 3, and 5 all call this same endpoint). The backend checks each incoming recipe's `recipeId` against what's already saved for that project: if it matches an existing one, overwrite it; if not, insert it as new. Consolidating all of these into one endpoint means the frontend never needs to branch its request logic based on which UI action triggered the save.

---

## 4. Start Afresh

- **Method:** POST
- **Endpoint:** `/projects/{projectId}/bill-of-quantities/reset`
- **Purpose:** Delete every recipe from a project's Bill of Quantities.
- **Request:** `projectId` passed in the URL path. No body needed.

**Response:**
```json
{ "success": true }
```

**What's happening:** This is the "Start Afresh" button on the project page (Web Spec, Section 4) — a full wipe of the project's Bill of Quantities, not a soft delete or archive. Every recipe tied to that project ID is removed in one go. Because this is destructive and irreversible, the frontend confirms with the user before calling it, and it's worth deciding whether the backend should log this action for audit purposes given how much work it can erase.

---

## 5. Delete Selected Recipes

- **Method:** DELETE
- **Endpoint:** `/projects/{projectId}/bill-of-quantities/recipes`
- **Purpose:** Delete specific recipes from a project's BoQ.

**Request:** `projectId` in the URL path.

```json
{
  "recipeIds": ["1223421eaasd3e2", "9f2c1aa03e7b41"]
}
```

**Response:**
```json
{ "success": true }
```

**Fixes from draft:** was written as a POST — deletions should use the DELETE method so the API is self-documenting. Also simplified `recipes: [{recipeId: ...}, {recipeId: ...}]` down to a flat list `recipeIds: [...]`, since `recipeId` was the only field in each object.

**What's happening:** This backs the "Delete Selected" flow (Web Spec, Section 2) — a user checks off individual recipes in the table (rather than wiping the whole thing via Start Afresh). The frontend collects the IDs of whatever's checked and sends just those; the backend removes only those recipes from the project, leaving everything else untouched.

---

## 6. Get Frequently Used Recipes

- **Method:** GET
- **Endpoint:** `/companies/{companyId}/recipes/frequent`
- **Purpose:** Get the recipes this company uses most often, for quick access in the Recipe Library.
- **Request:** `companyId` in the URL path. No body.

**Response:**
```json
{
  "recipes": [
    {
      "recipeId": "123zwew2q4srtdtyrf6889000",
      "category": "Walls",
      "recipeName": "Double Leaf Cavity Wall",
      "recipeUnitMeasure": "m2",
      "ingredients": [
        { "name": "Cement", "unit": "kg/m2", "rate": 0.001 },
        { "name": "Sand", "unit": "m2/m3", "rate": 0.0003 }
      ]
    }
  ]
}
```

Note this is the **Library Recipe** shape — no `quantity` field, since it isn't attached to a project yet. Matches the Web Spec's Library Recipe structure exactly.

**Open question (flagged "will come back to this" in the draft):** what determines "frequently used" — usage count, recency, or both — and is this per-company or per-user?

**What's happening:** This powers the default view of the Recipe Library (Web Spec, Section 1) — before a user types anything into search, they should see the recipes their company reaches for most, so they don't have to search for the same "Double Leaf Cavity Wall" every time they start a new project. Since the ranking logic isn't defined yet, the endpoint shape is here but the backend will need a way to track usage (e.g. incrementing a counter each time a recipe is added to a project via Operation 3).

---

## 7. Search Recipes

- **Method:** GET
- **Endpoint:** `/companies/{companyId}/recipes/search`
- **Purpose:** Search the recipe library by term.
- **Request:** `companyId` in the URL path; search term as a query parameter, e.g. `?query=cavity wall`.

**Response:**
```json
{
  "recipes": [
    {
      "recipeId": "123zwew2q4srtdtyrf6889000",
      "category": "Walls",
      "recipeName": "Double Leaf Cavity Wall",
      "recipeUnitMeasure": "m2",
      "ingredients": [
        { "name": "Cement", "unit": "kg/m2", "rate": 0.001 },
        { "name": "Sand", "unit": "m2/m3", "rate": 0.0003 }
      ]
    }
  ]
}
```

**Fix from draft:** the draft's search response was a single recipe object, while frequently-used was a list. Since a search can return multiple matches, both return a list, so the frontend doesn't need different handling per endpoint.

**What's happening:** This is what fires as the user types into the Recipe Library's search box (Web Spec, Section 1 — debounced 3s), so they can find a specific recipe instead of scrolling the frequently-used list. The backend matches the search term against recipe names and categories and returns whatever matches. Once a user finds the recipe they want here, it gets added to their project via Operation 3.

---

## Open Questions / Decisions Needed

1. **Unit of measure options** — confirm the full set of valid units (m2, kg/m2, m3, lm, etc.) so they can be validated server-side and offered as a fixed dropdown client-side.
2. **Quantity default of zero** — does `0` mean "not yet quantified" or a genuine zero? If those need to be distinguished, quantity may need an empty/unset state separate from zero. This also affects the Web Spec's "unsaved" tag logic, which currently keys off whether a save call has fired, not the value itself.
3. **"Frequently used" definition** — per-user or per-company, and what signal ranks them (usage count, recency, or a mix).
4. **Editing a library recipe** — does saving a recipe to a project (Operation 3) also edit the master library recipe, or is editing the library version a separate operation entirely?
5. **Recipe ownership when added to a project** — is a project-level recipe a live reference to the library version (library edits cascade to every project using it) or a frozen copy (project BoQs stay locked at time of add)? This affects how edits, deletes, and history behave across the whole feature, so it's worth deciding before development starts. The Web Spec currently assumes a frozen copy (it stores full `ingredients` on the BOQ line item rather than just a `recipeId` reference) — worth confirming that's intentional before building around it.
6. **"Complete Takeoff" state** — the Web Spec's Complete Takeoff action currently just calls Operation 3 like every other save. If completing a takeoff needs to actually change something server-side (e.g. lock the project from further edits, stamp a `completedAt` timestamp), that needs its own field or endpoint — nothing here currently distinguishes "saved" from "complete."

---

## Reconciliation Notes

Changes made to align this doc with the Web Spec:

- Confirmed **Library Recipe** (Operation 6/7) and **BoQ Line Item** (Operations 2/3) already included `recipeId` and `recipeUnitMeasure` — these were the fields missing on the web side, now added there to match.
- Added explicit cross-references from each operation back to the Web Spec section that calls it, so it's clear which frontend action maps to which endpoint.
- Added Open Question 6 to flag that the Web Spec's "Complete Takeoff" action doesn't currently correspond to any distinct server behavior — it silently reuses Operation 3. Flagging this in case takeoff completion is meant to be a real state change.
- **`success: true` convention:** removed from every GET response (Operations 1, 2, 6, 7) — reads either return the data or they error, so a redundant success flag on a 200 doesn't add anything. Kept on every POST/DELETE response (Operations 3, 4, 5), where it confirms a create/update/delete actually went through, which the client can't otherwise infer from the response body alone.