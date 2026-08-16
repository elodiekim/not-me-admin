# ADMIN.md

# NotMe Admin Dashboard Specification

Version: 1.0

---

# Overview

The Admin Dashboard is an internal web application used to operate and monitor NotMe.

It exists for two purposes:

1. Operate the MVP efficiently.
2. Demonstrate real-world admin tooling as a portfolio project.

The dashboard is intentionally lightweight and focuses only on operational features.

---

# Platform

- Web only
- Standalone application, separate from the consumer Expo app
- Desktop-first

---

# Access Control

Only administrator accounts may access the dashboard.

Authorization is enforced through:

```
profiles.is_admin
```

RLS policies:

- Admins can access all missions.
- Admins can access all profiles.
- Regular users can only access their own records.

Administrator accounts are assigned manually via SQL.

Users can never promote themselves to administrator.

---

# Login

A single screen: email, password, "Log In".

- No sign-up. No self-service password reset in MVP — admin accounts and credentials are shared manually, per Access Control above.
- Sign-in uses Supabase Auth (`signInWithPassword`).
- After a successful sign-in, check `profiles.is_admin` for that user:
  - `true` → proceed to Dashboard.
  - `false` → sign the user out immediately and show "Not authorized." A valid Supabase account without admin rights must never reach the dashboard, even for an instant.
- Failed sign-in (wrong email or password): show a generic "Invalid email or password." Never reveal whether the email exists.
- The session persists across reloads. Any screen other than Login redirects to Login when there is no session.

---

# Navigation

```
Dashboard

Missions

Users

Statistics
```

No additional navigation is included in MVP, aside from a persistent Logout control (not a nav item — always visible, e.g. in the header). Logout ends the Supabase session and returns to Login.

---

# Dashboard

The Dashboard gives administrators an immediate overview of platform health.

Data refreshes automatically when the tab regains focus or a screen is (re)opened — no polling, no realtime subscription in MVP. A manual Refresh action covers the rest. Revisit only if staleness turns out to be a real operational problem.

---

## KPI Cards

Display:

- Total Missions
- Completion Rate
- Total Users
- Average Hero Rating

**Completion Rate** = `completed / (completed + cancelled)`. In-progress missions are excluded from both sides — a mission that's currently stuck isn't a failure yet, and surfacing "stuck" is Operations Alerts' job, not this metric's. Fixed to all-time; no period filter on the Dashboard (it's a snapshot, kept to a glance — see Statistics for period filtering).

---

## Operations Alerts

Highlight operational issues requiring attention.

- Searching for more than 15 minutes

This is the only alert in MVP. "Awaiting Hero" and "Recently Cancelled Missions" were considered and dropped: every `requested` mission is definitionally awaiting a hero, so that alert only ever duplicated this one, and a cancelled mission is a closed state with no admin action attached to it — nothing to alert *for*. Revisit if a real need shows up (e.g. a distinct alert for a hero backing out after accepting, using `mission_cancellations`).

Clicking the alert opens the related mission.

---

## Mission Status Summary

Display current mission counts grouped by status.

- Searching
- Accepted
- On The Way
- Arrived
- Completed
- Cancelled

---

## Recent Missions

Display the most recent missions.

Columns:

- Mission ID
- Category
- User
- Hero
- Status
- Reward
- Created At

Selecting a row opens Mission Detail.

---

## Quick Actions

Provide shortcuts for common admin tasks.

Available actions:

- Search Mission
- Export Mission Data
- Refresh

---

# Missions

The primary operational screen.

---

## Filters

- Search
- Status
- Category
- Date Range

---

## Mission List

Columns:

- Mission ID
- User
- Hero
- Category
- Reward
- Status
- Created At

---

## Mission Detail

Display:

- Mission Information
- User Information
- Hero Information
- Status Timeline

---

### Status Timeline

```
Created

↓

Searching

↓

Accepted

↓

On The Way

↓

Arrived

↓

Completed
```

---

## Admin Actions

Available actions:

- Cancel Mission

Cancellation is intended only for abandoned or stuck missions.

Completed missions cannot be modified.

---

# Users

Displays all registered users.

---

## User List

Columns:

- Name
- Phone
- Join Date
- Total Requests
- Status

---

## User Detail

Display:

- Profile
- As Requester: Total Requests, Cancellations, Mission History
- As Hero: Missions Completed, Hero Rating, Reviews Written

Users can act as both requester and hero (no role column in the data model — see `notme-app`'s `CLAUDE.md`), so both sides are shown. Cancellations comes from `mission_cancellations` — it exists specifically to answer "how often does this person walk away," which is exactly the evidence an admin needs before using Disable Account.

---

## Admin Actions

- Disable Account
- Enable Account

---

# Statistics

Simple operational metrics only.

Display:

- Total Missions
- Completion Rate
- Signups Over Time
- Average Hero Rating

Completion Rate uses the same definition as the Dashboard's (`completed / (completed + cancelled)`).

Statistics are displayed using number cards and simple tables.

No chart libraries are used in MVP.

---

## Period Filter

Defaults to **All Time** — early stage, not enough volume yet for a shorter window to be meaningful.

Options in MVP: All Time (default), Last 30 Days.

Applies to every metric on this screen. The filter exists now so it's not a later rework, but All Time is the only setting that needs to be correct on day one.

---

# Design Principles

The Admin Dashboard should feel like an internal startup operations tool.

Principles:

- Desktop-first
- White background
- Light gray cards
- Minimal shadows
- Data-first layout
- Tables over illustrations
- Yellow used only as an accent color
- Fast scanning
- Clear hierarchy

---

# Out of Scope

The following features are intentionally excluded:

- Charts
- Push Notification Management
- Coupon Management
- CMS
- Announcements
- Marketing Analytics
- Customer Support
- Audit Logs
- Role Management
- System Status widget — with no backend, "Database/Storage Issue" would have no real signal to draw from (this app doesn't even touch Storage). A fake status card would misrepresent itself as monitoring. If a query fails, that screen shows its own error state instead.

---

# MVP Success

The Admin Dashboard succeeds if administrators can:

- Monitor platform health
- Find any mission quickly
- Cancel stuck missions
- Manage users
- View operational statistics

Nothing more is required for MVP.

---

# Final Statement

The Admin Dashboard is an operational tool—not a business intelligence platform.

Every feature should directly help administrators operate NotMe while keeping the implementation simple, maintainable, and focused on the MVP.
