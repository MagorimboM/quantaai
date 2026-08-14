# Quanta Recipe Library — Server Spec

## Overview

This feature gives each company its own recipe collection. From this endpoint, a user can view, create, edit, and delete the recipes belonging to their company.

---
## 1. Get Most Used Recipes

- **Method:** GET
- **Endpoint:** `/companies/{companyId}/recipes/most-used`
- **Purpose:** Get the company's recipe collection, ranked by how often each recipe is used.
- **Request:** `companyId` passed in the URL path. No body.

**Response:**

```json
{
  "companyId": "123AADFVRTG4122",
  "companyName": "Acme Construction",
  "recipes": [
    {
      "recipeId": "1234aaksle000",
      "category": "Concrete Slab",
      "recipeName": "Slab",
      "description": "Standard residential concrete slab with reinforcement",
      "materials": [
        {
          "name": "Concrete Mix",
          "unitMeasure": "m3/m2",
          "quantity": 2.5
        },
        {
          "name": "Z-Bars",
          "unitMeasure": "per external slab corner",
          "quantity": 2
        }
      ]
    }
  ]
}
```
This is a **flat list** — every recipe carries its own `category` field. There's no grouped/nested shape returned here (see Reconciliation Notes on the Categories component).

**What's happening:** This is the default view of the company's Recipe Library management page (Web Spec, "on mount") — the recipes a company reaches for most, surfaced first so users aren't hunting through an alphabetical list for "Slab" every time.

---

## 2. Update Recipe

- **Method:** PUT
- **Endpoint:** `/companies/{companyId}/recipes/{recipeId}`
- **Purpose:** Update an existing recipe belonging to a company — its name, description, and/or materials.

**Request:** `companyId` and `recipeId` in the URL path.

```json
{
  "recipeName": "Concrete Slab",
  "description": "Standard residential concrete slab with reinforcement",
  "materials": [
    {
      "name": "Concrete Mix",
      "unitMeasure": "m3/m2",
      "quantity": 2.5
    },
    {
      "name": "Z-Bars",
      "unitMeasure": "per external slab corner",
      "quantity": 2
    }
  ]
}
```

**Response:**

```json
{ "success": true }
```

**What's happening:** This fires when a user edits a recipe from the company's library (Web Spec: card's three-dot menu → "Edit Recipe" → "Save Changes") — renaming it, rewriting its description, or adjusting its materials and quantities. Because `recipeId` is in the URL, the backend knows exactly which recipe to overwrite; the whole `materials` list is expected to be sent each time, replacing what was there before, rather than being merged field-by-field.

The Web Spec's edit flow warns the user that "other projects will be affected" before saving — that assumes updates cascade to every place the recipe has already been used. **That's still Open Question 2 below, unresolved.** The frontend copy shouldn't assert cascading behavior as fact until this is actually decided.

---

## 3. Create Recipe

- **Method:** POST
- **Endpoint:** `/companies/{companyId}/recipes`
- **Purpose:** Create a brand new recipe for the company's library.

**Request:** `companyId` in the URL path.

```json
{
  "category": "Concrete Slab",
  "recipeName": "Slab",
  "description": "Standard residential concrete slab with reinforcement",
  "materials": [
    {
      "name": "Concrete Mix",
      "unitMeasure": "m3/m2",
      "quantity": 2.5
    },
    {
      "name": "Z-Bars",
      "unitMeasure": "per external slab corner",
      "quantity": 2
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "recipeId": "1234aaksle000"
}
```

**What's happening:** This is what fires when a user clicks "New Recipe" in the library (Web Spec's modal — `category`, `description`, `recipeName`, `materials`) and submits the form for the first time. The backend generates a new `recipeId`, saves the recipe against the company, and returns that ID so the frontend can immediately load or link to the recipe it just created without a second round-trip.

---

## 4. Delete Recipe(s) from Company

- **Method:** DELETE
- **Endpoint:** `/companies/{companyId}/recipes`
- **Purpose:** Delete one or more recipes from the company's library.

**Request:** `companyId` in the URL path.

```json
{
  "recipeIds": ["aaswed124000", "1234aaksle000"]
}
```

**Response:**

```json
{ "success": true }
```

**What's happening:** This backs a delete action in the library — whether that's a single recipe's delete button (from the card's three-dot menu) or a multi-select "delete selected" across several checked rows. This is a **hard delete**, which matters because the Web Spec also describes an "archived" state (a "Show Archived Recipes" button) — those are two different things, and right now only hard delete is defined server-side. See Open Question 5.

Worth deciding whether deleting a library recipe should be blocked (or just warned) if that recipe is currently in use elsewhere — same underlying cascading question as Operation 2.

---

## 5. Search Company Recipes

- **Method:** GET
- **Endpoint:** `/companies/{companyId}/recipes/search`
- **Purpose:** Search the company's recipe library by term.
- **Request:** `companyId` in the URL path; search term as a query parameter, e.g. `?query=slab`.

**Response:**

```json
{
  "recipes": [
    {
      "recipeId": "aaswed124000",
      "category": "Concrete Slab",
      "recipeName": "Concrete Slab",
      "description": "Standard residential concrete slab with reinforcement",
      "materials": [
        {
          "name": "Concrete Mix",
          "unitMeasure": "m3/m2",
          "quantity": 2.5
        },
        {
          "name": "Z-Bars",
          "unitMeasure": "per external slab corner",
          "quantity": 2
        }
      ]
    }
  ]
}
```

**What's happening:** This is the fallback the search bar calls (Web Spec: after 3s idle, if no match exists in what's already loaded on the frontend) — as the user types, matching recipes come back by name, category, or description.

---

## Open Questions / Decisions Needed

1. **`category` vs `scope`** — resolved for this pass: standardizing on `category`, since it's already used in every operation above and in the Web Spec's data structure. If `scope` is preferred instead, both docs need to change together.
2. **Cascading updates** — when a recipe here is updated or deleted, does that affect anywhere else it's already been used, or is each use a frozen copy from the moment it was taken? Affects Operations 2 and 4 directly, and the Web Spec's edit-warning copy currently assumes the answer is "yes, it cascades" — that needs to be confirmed, not assumed.
3. **Recipe creation permissions** — can any user in the company create/edit/delete recipes, or is this restricted to certain roles (e.g. admins/estimators)? Not addressed in either draft, but worth deciding before building the UI — the Web Spec's three-dot menu currently shows edit/delete to any viewer.
4. **Duplicate recipe names** — should the backend prevent two recipes in the same company with the same `recipeName` and `category`, or is duplication allowed (e.g. two slightly different "Slab" recipes for different use cases)?
5. **Archiving** — the Web Spec has a "Show Archived Recipes" button and treats archiving as distinct from deleting, but nothing here defines it: no `status`/`archived` field on the recipe object, and no archive/unarchive endpoint. Either this needs to be added (e.g. a `PATCH .../recipes/{recipeId}/archive` and a `status` field returned by Operations 1 and 5), or archiving needs to be descoped from the current build.
6. **Pagination** — the Web Spec's "on mount" step says it loads a "paginated recipe list," but Operation 1's response has no pagination fields (`page`, `pageSize`, `totalCount`, cursor, etc.), and `/most-used` reads more like a curated top-N list than a paged full-library browse. Worth confirming whether a separate paginated "browse all recipes" endpoint is actually needed, distinct from Most Used and Search.

---
