---
name: Phase 2 auth architecture
description: How user auth, reviews, favorites are implemented in Phase 2
---

## Auth
- bcrypt + express-session (connect-pg-simple stores sessions in postgres `session` table)
- SESSION_SECRET env var already provisioned
- Session data: `{ userId, userRole }` on `req.session`
- Routes: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- `useCurrentUser()` hook returns null when unauthenticated (no throw)

## New tables (additive migration, Phase 2)
- `users`: id, email, password_hash, name, phone, role (user/owner/staff/admin), parlour_id, created_at
- `reviews`: id, parlour_id, user_id, rating (1-5), comment, created_at
- `favorites`: id, user_id, parlour_id, created_at, UNIQUE(user_id, parlour_id)

## Reviews
- Creating a review auto-recomputes parlour.rating and parlour.total_reviews
- One review per user per parlour (enforced in route)

## Admin
- requireAdmin middleware checks session.userRole === "admin"
- Admin routes: /api/admin/stats, /api/admin/users, /api/admin/parlours, /api/admin/bookings
- Admin dashboard at /admin route

**Why bcrypt+session over Firebase:** Firebase secrets were not provided; server-side session auth is self-contained and works with existing PostgreSQL.
