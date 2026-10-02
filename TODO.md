# Flow & Styling Rework

## 1. Restructure: what happens after a successful login/register

- [ ] Re-enable the `WorkspaceSwitcherPage` route in `App.tsx` (currently commented out)
- [ ] `LoginPage`'s success modal "Continue" button: navigate to the workspace switcher, not `/dashboard`
- [ ] `RegisterPage`'s success modal "Continue" button: same change
- [ ] Decide: does a first-time user (zero workspaces) land on the switcher too, or go straight into a "create your first workspace" screen? Pick one and make it explicit in the routing logic, not implicit
- [ ] Confirm the actual intended flow end to end: Landing → Register/Login → Workspace Switcher → (click a workspace) → Dashboard. Write this down somewhere so it's the reference, not tribal knowledge

## 2. Homepage / Workspace Switcher — redo

- [ ] Rebuild with the warm palette (cream background, orange accent, JetBrains Mono) — this screen is still "arriving," not working yet, so it stays warm
- [ ] Remove the `navigation.navigate(...)` style bugs if any remain in this area (confirm `useNavigate()` is used correctly on both card types)

**Data to display, per the earlier brief — confirm these are actually wired to real data, not placeholders:**

- [ ] Greeting with the user's actual name (from Clerk / the local `User` row — currently hardcoded to "User")
- [ ] Personal workspace card: project count, recipe count, last active time, urgency badge (e.g. "2 projects due this week")
- [ ] Company workspace cards (sorted most-recently-active first): company name, project count, recipe count, last active time, same urgency badge
- [ ] "Show Archived" toggle for company workspaces (`Company.isArchived` exists in the schema, unused so far)
- [ ] First-time empty state — zero workspaces should not look like a loading bug
- [ ] Loading skeletons while workspace data fetches, matching the pattern already used in `RecipeCategoryList`

## 3. Inside a workspace — styling on entry

- [ ] Confirm/decide the exact click-to-enter transition: workspace card click → sets `workspaceId`/`companyId` in localStorage → navigates to `/dashboard`
- [ ] This is the actual warm-to-black-and-white transition point — make sure it's the _only_ place that shift happens, not something that also flickers on the switcher itself
- [ ] Audit `DashBoardPage` and everything under it for the black-and-white / shadcn-neutral theme consistency (no leftover warm-palette colors bleeding in from copy-pasted landing components)

## 4. Bill of Quantities / Quantity Takeoff page — revamp

- [ ] Redesign pass on `BillOfQuantsPage` — current layout/styling needs a real revisit, not just bug fixes
- [ ] Wire the "Preview Quantities" button (currently has no `onClick` at all) to the actual recipe-calculation logic: `RecipeMaterial.quantity × TakeoffItem.measurement`, aggregated per line item
- [ ] Make the measurement input in `LineItem` actually controlled/editable (currently just a `placeholder`, not a real value)

**New line item flow — what should show when a recipe is attached:**

- [ ] Recipe name — visible directly on the line item row, not hidden behind a click
- [ ] Category the recipe belongs to — visible alongside the name
- [ ] Calculated quantities for that recipe's ingredients (materials/labour/overheads), based on the measurement entered — this is the actual "Preview Quantities" payoff, surfaced per line item, not just in a separate global preview
- [ ] Decide: does this show inline in the row, in the existing expandable "show recipe materials" section (`RecipeModal`), or somewhere new? Pick one, since right now the expand/collapse exists but doesn't show calculated quantities, only static recipe contents
- [ ] Restyle this whole section once the above is decided — you flagged the styling here should be different from the rest of the page, so this isn't just a data change, it's a distinct visual treatment

## Open decisions before starting (answer these first, they affect scope)

- [ ] Does the workspace switcher's warm styling extend anywhere _inside_ the workspace, or is the switch to black-and-white immediate and total on entry?
- [ ] For the takeoff page's recipe display: inline in the row vs. inside the existing expandable section vs. a new component — which one?
- [ ] First-time user with zero workspaces: switcher-with-empty-state, or skip straight to a creation flow?
