---
name: NeoBuilder ERP auth/permission shape
description: The sanitized user/role/permission JSON contract between the Express backend and React frontend for this construction ERP project.
---

The backend's `sanitizeUser` helper returns a specific shape that the frontend must mirror exactly, rather than assuming generic field names:

- `user.id` (not `_id`), `user.isOwner` (boolean — bypasses all permission checks entirely).
- `user.role.id`, `user.role.name`, `user.role.permissions` — permissions is a **plain object** keyed by `moduleKey` (e.g. `departments`, `users`, `company`), where each value is `{view, create, edit, delete, print, export, approve}` booleans. It is NOT an array of `{module, actions}` pairs — a Mongoose `Map` field serializes to a plain object in JSON.
- Signup requires `contactPerson`, `mobileNo`, `acceptTerms` (not a generic `name` field) — always verify actual backend validation schemas with a curl round-trip before wiring a signup/login form, rather than assuming field names from the spec doc.

**Why:** Assuming array-of-permissions or generic `name` fields (common in other ERP/boilerplate patterns) caused sidebar visibility and signup submission to silently fail against this backend's actual contract.

**How to apply:** When building permission-gated UI (sidebars, route guards) or auth forms in this codebase, check `moduleKey`-based object lookups (`user.role?.permissions?.[moduleKey]?.view`) and `user.isOwner` shortcut, and confirm field names against the actual controller/schema — not assumptions — via a quick curl test.
