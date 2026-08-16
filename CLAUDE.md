# CLAUDE.md

# NotMe Development Guide

This document defines the engineering rules for the NotMe project.

Always follow these rules unless explicitly instructed otherwise.

---

# Source of Truth

Development decisions should follow this order:

1. PRODUCT.md
2. DESIGN.md
3. ADMIN.md
4. CLAUDE.md

Never implement features that contradict PRODUCT.md.

---

# Tech Stack

## Frontend

- Vite
- React
- React Router
- TypeScript
- Tailwind CSS
- shadcn/ui

## Data

- TanStack Query
- TanStack Table

## Backend

- Supabase (no separate backend — client talks to Supabase directly)

## Database

- PostgreSQL

## Authentication

- Supabase Auth (email/password), gated by `profiles.is_admin`

## Storage

- Supabase Storage

## Deployment

- Vercel (static build, same platform as the consumer app's landing page)

---

# Architecture Notes

No custom backend or API routes. All data access goes through the Supabase JS client (anon key) from the browser, protected entirely by RLS — the same pattern as the consumer app.

This is a deliberate constraint, not an oversight: it keeps the Service Role Key out of the codebase entirely. Any admin action that would require the Service Role Key (e.g. banning a user via the Supabase Auth admin API) is out of scope — see "Disable/Enable Account" below.

## Disable/Enable Account

Implemented via a `profiles.is_active` flag (not Supabase Auth's ban/admin API). Disabling sets `is_active = false`, which blocks that user from creating or claiming new missions (RLS) — it does not touch missions already in progress. Shipped in `notme-app`'s `0015_admin_flags_and_actions.sql`.

## Data Freshness

No polling, no Supabase Realtime subscriptions in MVP. Rely on TanStack Query's default refetch-on-focus/refetch-on-mount, plus a manual Refresh action on the Dashboard. This is free with the chosen data layer — revisit only if staleness turns out to be a real operational problem, not proactively.

---

# Development Philosophy

NotMe is an MVP.

Always choose:

- Simplicity
- Readability
- Maintainability

Avoid overengineering.

If there are multiple solutions, choose the simplest one.

---

# Architecture

Follow feature-based organization.

```
app/
components/
features/
hooks/
lib/
providers/
services/
types/
utils/
```

Rules:

- Shared UI → components
- Business logic → features
- API access → services
- Reusable utilities → utils

---

# Product Rules

Follow PRODUCT.md.

Do not invent new features.

If a feature is not documented, assume it is out of MVP scope.

---

# Design Rules

Follow DESIGN.md.

Consumer App:

- Friendly
- Minimal
- Reassuring

Admin Dashboard:

- Professional
- Functional
- Data-first

Never mix the two styles.

---

# Admin Dashboard Rules

Follow ADMIN.md.

The Admin Dashboard is:

- Web only
- Desktop-first
- Internal only

Always prefer:

- Tables
- KPI Cards
- Simple Filters

Do not add:

- Charts
- Decorative illustrations
- Marketing components

The Admin Dashboard is an operational tool.

---

# Database

Supabase is the single source of truth.

Prefer normalized data.

Avoid duplicated fields unless absolutely necessary.

---

# Authentication

Authentication:

- Supabase Auth

Authorization:

- Row Level Security (RLS)

Admin access:

```
profiles.is_admin
```

Never bypass RLS.

Never expose privileged operations to the client.

---

# Coding Style

Prefer:

- Small components
- Small functions
- Strong typing
- Descriptive names

Avoid:

- Large files
- Duplicate code
- Deep nesting
- Magic numbers

---

# Component Rules

Components should have a single responsibility.

Extract reusable UI when repeated.

Keep screens focused.

One primary action per screen.

---

# State Management

Prefer:

- React hooks
- Local state

Use Context only when necessary.

Avoid unnecessary global state.

---

# Styling

Keep styling consistent.

Follow the Design System.

Prefer reusable components over custom styling.

Avoid inline styles unless trivial.

---

# Error Handling

Every screen must handle:

- Loading
- Empty
- Error

Never leave blank screens.

---

# Performance

Avoid premature optimization.

Optimize only when a real bottleneck exists.

---

# Security

Never expose:

- Service Role Key
- Environment Secrets
- Admin APIs

Protect all privileged operations with RLS.

---

# Accessibility

Support:

- Readable typography
- Large touch targets
- High contrast

Status should never rely only on color.

---

# What NOT to Build

Unless explicitly requested, do NOT add:

- Chat
- Push Notifications
- Coupons
- CMS
- Marketing Analytics
- BI Dashboard
- Gamification
- Live Map Tracking
- Two-way Reviews
- Role Management

These are intentionally outside MVP scope.

---

# Development Priorities

Always prioritize:

1. Simplicity
2. User Experience
3. Maintainability
4. Performance

Feature count is never the priority.

---

# Final Rule

When making implementation decisions:

- Follow PRODUCT.md.
- Follow DESIGN.md.
- Follow ADMIN.md.
- Keep the MVP focused.
- Prefer the simplest maintainable solution.
