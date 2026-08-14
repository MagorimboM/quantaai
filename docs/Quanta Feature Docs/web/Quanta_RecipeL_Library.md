# Quanta Recipe Library — Web Spec


## Overview

This page shows the recipes created by the user for that specific company. On this page the user can:

- Create new recipes
- Search through existing recipes for that company
- Delete or edit existing recipes

---

## Components

- **Categories Component** — shows the categories of the recipes (e.g. Walls, Floor, Roof). This is the main controller: it receives the full recipe list and groups/filters what's shown. Clicking "All Recipes" shows everything; clicking "Walls" filters the list down to recipes where `category === "Walls"`.
- **Recipes List Component** — renders each recipe as a card, showing `recipeName`, `description`, and `category`.
- **Search Bar Component** — searches the recipes already loaded on the page; if nothing matches, fires a request to the backend.

## Buttons

- **Show Archived Recipes** — shows the archived recipes for that company. **Not yet supported server-side — see Reconciliation Notes.**
- **New Recipe** — opens a modal with a form: `category`, `description`, `recipeName`, `materials`.

---

## Data Pipeline

### On mount

- `GET /companies/{companyId}/recipes/most-used`
- Returns a **flat** list of recipes, each carrying its own `category` field.
- The Categories Component groups this flat list into category buckets client-side (e.g. via a `reduce` on `category`) — the API does not return pre-grouped data, so there's no separate structure to keep in sync.

### Search (event-driven)

- User types in the search bar.
- After 3 seconds of inactivity, first check the already-loaded recipes (from on-mount or a prior search) for a match client-side.
- If nothing matches locally, `GET /companies/{companyId}/recipes/search?query={term}` → merge results into local state.

### Edit recipe (event-driven)

- User clicks a card's three-dot menu → "Edit Recipe."
- On "Save Changes": confirm the change with the user, warning that other projects using this recipe may be affected.
  - **This warning currently assumes updates cascade to every project already using the recipe. That's unresolved — see Server Spec Open Question 2. Don't ship copy that states this as fact until it's confirmed; word it conditionally until then (e.g. "this may affect other projects using this recipe").**
- On confirm: `PUT /companies/{companyId}/recipes/{recipeId}` with the full updated recipe (name, description, materials).
- On success: update the matching recipe in local state in place (matched by `recipeId`).

### Create recipe (event-driven)

- User clicks "New Recipe" → fills out modal (`category`, `description`, `recipeName`, `materials`) → submits.
- `POST /companies/{companyId}/recipes`
- On success: push the new recipe (now including the server-generated `recipeId`) into local state.

### Delete recipe (event-driven)

- User selects one or more recipes (single delete from a card, or multi-select "delete selected").
- `DELETE /companies/{companyId}/recipes`, body: `{ "recipeIds": [...] }`
- On success: remove the deleted recipes from local state.
- This is a **hard delete** — there is no "undo" or archive step tied to this action (see Show Archived Recipes, above).

---

## Component Structure

```
Project Page
 └─ state: recipeLibraryState (flat list of recipes, each with its own `category`)
     └─ Categories Component (main controller)
          - reads recipeLibraryState
          - groups/filters it client-side by category for display
          - passes filtered results down to:
               ├─ Recipes List Component (renders cards)
               └─ Search Bar Component
                    - reads recipeLibraryState first (client-side match)
                    - falls back to GET .../recipes/search on no match
                    - writes results back into recipeLibraryState
```

---

## Data Structures

This now mirrors the server's shape exactly — same field names, same nesting (flat, not grouped) — so there's no translation layer between what the frontend sends/receives and what the API defines.

### Recipe

```json
{
  "recipeId": "1234aaksle000",
  "category": "Walls",
  "recipeName": "Wall",
  "description": "",
  "materials": [
    { "name": "Brick", "unitMeasure": "m2/lm", "quantity": 21 },
    { "name": "Sand", "unitMeasure": "m2/lm", "quantity": 21 },
    { "name": "Cement", "unitMeasure": "m2/lm", "quantity": 21 }
  ]
}
```

Recipes arrive from the API as a **flat array** of these objects (see Operations 1 and 5 in the Server Spec) — there is no `{ category, recipes: [...] }` grouped structure coming from the backend. The Categories Component is responsible for grouping them by `category` for display.

---

## Open Questions / Decisions Needed

1. **Archiving** — this page assumes archived recipes are a real, distinct state from deleted ones (the "Show Archived Recipes" button), but the Server Spec doesn't define a `status`/`archived` field or an archive endpoint yet. Needs to be added server-side, or descoped from this build. See Server Spec Open Question 5.
2. **Pagination** — the original draft describes the on-mount recipe list as "paginated," but `/most-used` doesn't return pagination metadata and reads more like a curated top list. Confirm whether a separate paginated "browse all" endpoint is actually needed. See Server Spec Open Question 6.
3. **Cascading updates** — the edit flow's "this affects other projects" warning needs the underlying question (Server Spec Open Question 2) resolved before the copy can state it as fact.
4. **Permissions** — the three-dot menu currently shows edit/delete to any user viewing the page; confirm whether this should be role-gated (see Server Spec Open Question 3) before it ships.

---
