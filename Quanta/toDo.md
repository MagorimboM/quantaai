QUANTA AI – To-Do List
1. Edit Recipes
[ ] Let users edit component quantities
[ ] Let users add or remove components
[ ] Add a choice when saving: "Just for now" (one-time override) or "Forever" (permanently updates the recipe)
[ ] Support non-continuous units for components that are measured in packages, rounded-off amounts, etc. (e.g., unit type, package size, 
rounding rule)
[ ] Make sure the one-time change doesn't overwrite the saved recipe
2. Share Recipes
[ ] Let users share company recipes with another user
[ ] Only allow sharing with someone who is logged in and has an account in the app
[ ] Define permissions for recipients (view only vs. can edit)
[ ] Add a way to see and revoke shared recipes
3. Input Sanitization (Zod)
[ ] Add Zod schemas for all user inputs
[ ] Validate on the front end (forms)
[ ] Validate on the back end (API routes), so the server never trusts the client
[ ] Share schemas between front end and back end where possible
[ ] Return clear error messages for invalid input
4. Fix Routing / Access Control
[ x] Add auth guards on all protected routes
[ x] If a user manually types in a URL that needs credentials or data they don't have access to, redirect them to the workspace
[ x] Check permissions on the back end too, not just in the UI
[ x] Handle invalid or nonexistent IDs in URLs the same way (redirect to workspace)
I can also break these into smaller tickets with priorities or estimates if that would help.


25 c * 1100mm