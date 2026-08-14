# Bill of Quantities Feature — Web Spec

> Reconciled against the Server Spec so every request/response shape and endpoint here matches what the API actually defines. See **Reconciliation Notes** at the bottom for exactly what changed.

## Overview

Users browse a library of recipes (material build-ups), add them to a project's Bill of Quantities (BOQ), input measured quantities, and generate a final takeoff.

---

## 1. Library Modal

**Purpose:** Browse and search recipes, add selected ones to the BOQ.

### On mount

- `GET /companies/{companyId}/recipes/frequent`
- Fetch most frequently used recipes (grouped by category).
- Each recipe includes: `recipeId`, `category`, `recipeName`, `recipeUnitMeasure`, and `ingredients` (`name`, `unit`, `rate`).
- Store result in local state for display.

### Search

- User types in search bar.
- After 3 seconds of inactivity, trigger auto-search (debounced).
- `GET /companies/{companyId}/recipes/search?query={term}` → response stored in local state.
- Results shown by category first, ingredients revealed on click (same pattern as preload).

### Add to Bill of Quantities

- User clicks a recipe → "Add to Bill of Quantities."
- `POST /projects/{projectId}/bill-of-quantities`, body: `{ "recipes": [<recipe with quantity>] }`
- On success → add to local `billOfQuantsState` (consumed by BOQ modal) → show confirmation toast/message.
- The recipe is copied from the library into the project's BOQ at this point, keeping its `recipeId` and adding a `quantity` field (defaults to `0` until the user enters one).

---

## 2. Bill of Quantities (List/View)

**Purpose:** Manage recipes added from the library — input real quantities, save, preview, and delete.

### Adding quantities

- Each line item acts as a form — user enters a quantity (e.g. m², units).
- Auto-save: after 5 seconds of no input, `POST /projects/{projectId}/bill-of-quantities` with the updated recipe → tag changes from "unsaved" to "saved."
- Manual save: user can save all items at once via the same `POST /projects/{projectId}/bill-of-quantities` endpoint (sending the full `recipes` array) → replace local state with server response → tag updates to "saved."
- Both auto-save and manual save hit the same endpoint — the server matches on `recipeId` and updates in place rather than duplicating (see Server Spec, Operation 3).

### Expanding a line item

- Shows the ingredients within that recipe.
- Displays a calculated total per ingredient (based on `quantity` entered × ingredient `rate`) — computed client-side, no fetch required.

### Removing a recipe

- User expands a category, selects a recipe they want to remove.
- `DELETE /projects/{projectId}/bill-of-quantities/recipes`, body: `{ "recipeIds": [...] }` → on success, remove from local state.

---

## 3. Preview

- Pulls all current BOQ line items from local state.
- Displays categories, quantities entered, and totals in a modal.
- `POST /projects/{projectId}/bill-of-quantities` saves current state to the database before showing preview (ensures nothing is lost) — same endpoint as manual save.
- Preview modal: shown as a blurred-background overlay, contents rendered as PDF or plain styled view.
- Includes a **Download PDF** button.

---

## 4. Start Afresh

- On click → confirmation modal ("Are you sure?").
- On confirm → `POST /projects/{projectId}/bill-of-quantities/reset` → wipes all BOQ line items for that project.

---

## 5. Complete Takeoff

- Sends any remaining unsaved items via `POST /projects/{projectId}/bill-of-quantities` (the same add/update endpoint used everywhere else in this feature — there's no separate "complete" payload or endpoint).
- On success → mark all items "saved" in local state, notify user everything is saved.
- Opens the "Complete Takeoff" view/summary, scoped by the `projectId` already in the URL — no extra identifiers need to be sent.

---

## Component Structure

```
Project Page
 └─ state: billOfQuantsState
     ├─ Bill of Quantities Component
     │    - reads/writes billOfQuantsState
     │
     └─ Library Modal
          - reads/writes billOfQuantsState (adds items)
          - own state: searchResultsState
               (on add: remove item from searchResultsState → push into billOfQuantsState)
```

---

## Data Pipeline / Flow Tree

```
Project Page
│
├── owns: billOfQuantsState  (source of truth)
│
├── Library Modal
│   ├── owns: searchResultsState (local, ephemeral)
│   ├── READS: nothing from Project Page
│   ├── WRITES: billOfQuantsState (on "Add to BOQ")
│   │
│   ├── on mount → GET /companies/{companyId}/recipes/frequent → searchResultsState
│   ├── on search → GET /companies/{companyId}/recipes/search?query=... → searchResultsState
│   └── on add → POST /projects/{projectId}/bill-of-quantities
│                → push recipe into billOfQuantsState (Project Page)
│                → (optionally) remove from searchResultsState
│
├── Bill of Quantities Component
│   ├── READS: billOfQuantsState
│   ├── WRITES: billOfQuantsState
│   │
│   ├── on quantity input (debounced 5s) → POST /projects/{projectId}/bill-of-quantities
│   │                                    → mark item "saved" in billOfQuantsState
│   ├── on manual save → POST /projects/{projectId}/bill-of-quantities (bulk)
│   │                  → replace billOfQuantsState with server response
│   ├── on expand line item → compute totals (derived, no fetch — pure calculation from billOfQuantsState)
│   └── on delete recipe → DELETE /projects/{projectId}/bill-of-quantities/recipes
│                        → remove from billOfQuantsState
│
├── Preview
│   ├── READS: billOfQuantsState (read-only, no local state of its own)
│   ├── on open → POST /projects/{projectId}/bill-of-quantities (save current state)
│   │           → render preview from billOfQuantsState (not from DB response)
│   └── on download → generate PDF from billOfQuantsState
│
├── Start Afresh
│   ├── WRITES: billOfQuantsState
│   └── on confirm → POST /projects/{projectId}/bill-of-quantities/reset
│                   → clear billOfQuantsState
│
└── Complete Takeoff
    ├── READS: billOfQuantsState
    ├── WRITES: billOfQuantsState
    └── on click → POST /projects/{projectId}/bill-of-quantities (unsaved items)
                  → mark all "saved" in billOfQuantsState
                  → open Complete Takeoff summary view
```

**The pipeline in one line:**
`Library Modal (fetch/search) → billOfQuantsState (single source of truth on Project Page) → BOQ Component (edit/calculate) → Preview/Complete Takeoff (consume, don't mutate structure — just read + persist)`

**Ownership rule this enforces:** every child component either **reads-only** (Preview) or **reads+writes** (Library, BOQ, Start Afresh, Complete Takeoff) — but nothing except Project Page actually _owns_ `billOfQuantsState`. Children never hold their own copy of BOQ data; they always go through the parent.

---

## Data Structures

These now mirror the server's shapes exactly — same field names, same nesting, so no translation layer is needed between what the frontend sends/receives and what the API defines.

### Library Recipe (no `quantity` — not yet attached to a project)

```json
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
```

> **Category** represents the building element/scope a recipe belongs to — e.g. `Walls`, `Slab`, `Roof`, `Openings`.
> **Recipe name** represents the specific build-up/construction method within that category.

### Bill of Quantities Line Item (project-level — carries `quantity`)

```json
{
  "recipeId": "123zwew2q4srtdtyrf6889000",
  "category": "Walls",
  "recipeName": "Double Leaf Cavity Wall",
  "recipeUnitMeasure": "m2",
  "quantity": 0,
  "ingredients": [
    { "name": "Cement", "unit": "kg/m2", "rate": 0.001 },
    { "name": "Sand", "unit": "m2/m3", "rate": 0.0003 }
  ]
}
```

`quantity` defaults to `0` when a recipe is first added from the library, then gets updated as the user fills in the form.

---

## Open Questions / Decisions Needed

1. **Save strategy conflict** — auto-save (5s debounce) + manual save + save-on-preview all hit the same endpoint. Need to confirm the backend safely handles rapid repeated calls (e.g. debounce/throttle server-side too, or accept the frontend already guards against overlap).
2. **Delete flow** — optimistic UI (remove immediately, roll back on failure) vs. wait-for-server-confirmation before removing from local state.
3. **Recipe snapshot vs. reference** — BOQ line items store a full copy of the recipe (including ingredients/rates) rather than just a `recipeId` reference. Server Spec Open Question 5 covers this — worth confirming this is intentional (locks in rates at time of use) before building the UI around it.
4. **Quantity zero vs. unset** — see Server Spec Open Question 2. If those states need to be distinguished, the frontend's "unsaved" tag logic and the `quantity: 0` default may need to change together.

---

## Reconciliation Notes

Changes made to align this doc with the Server Spec:

- **Search** was POST in the original draft; the server only defines search as `GET .../recipes/search?query=`. Changed to GET.
- **Auto-save / manual save** were PUT in the original draft; the server's only add/update endpoint (Operation 3) is POST and handles both insert and update by matching `recipeId`. Changed both to POST.
- **Start Afresh** was DELETE in the original draft; the server defines this as `POST .../reset`, not a DELETE call. Changed to POST.
- **Library Recipe** and **BOQ Line Item** were missing `recipeId` and `recipeUnitMeasure`, both of which the server always returns and expects. Added both fields to each structure.
- **Complete Takeoff** had its own payload shape (`{ userId, projectId }`) that didn't correspond to anything the server defines. There's no dedicated "complete" endpoint server-side — this action now reuses the same `POST .../bill-of-quantities` call as auto-save/manual-save/preview, with `projectId` coming from the URL rather than the body. If a real "mark as complete" state is needed later (e.g. a `status` field on the project), that needs to be added to the Server Spec first.