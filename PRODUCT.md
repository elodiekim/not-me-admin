# Admin Dashboard

The Admin Dashboard is an internal web application used to operate and monitor NotMe.

It exists for two purposes:

1. Operate the MVP efficiently.
2. Demonstrate real-world operational tooling as part of the project portfolio.

The Admin Dashboard is intentionally lightweight and focuses only on the functionality required to operate the platform.

---

## Platform

- Web only
- Standalone application, separate from the consumer Expo app
- Desktop-first
- Not publicly accessible in practice — not linked from anywhere public, excluded from search indexing (`noindex`, `robots.txt`). The real boundary is Access below (Auth + RLS): without an `is_admin` account, no operational data is reachable even if the URL is known. No edge-level gate (e.g. Vercel Deployment Protection) in MVP — reassess only if this ends up handling more sensitive data or a larger admin team.

---

## Access

Only administrator accounts may access the dashboard.

Authorization is enforced through:

```
profiles.is_admin
```

RLS policies allow administrators to access all operational data.

Administrator accounts are assigned manually through SQL.

Users can never promote themselves to administrator.

---

## MVP Scope

### Dashboard

Provides an overview of platform health.

Display:

- Total Missions
- Completion Rate
- Total Users
- Average Hero Rating

Also includes:

- Operations Alerts
- Mission Status Summary
- Recent Missions
- System Status
- Quick Actions

---

### Mission Management

Administrators can:

- View all missions
- Search missions
- Filter by status
- View mission details
- Manually cancel stuck or abandoned missions

---

### User Management

Administrators can:

- View all users
- View user details
- Disable problematic accounts
- Re-enable accounts

---

### Statistics

Simple operational metrics only.

Display:

- Total Missions
- Completion Rate
- Signups Over Time
- Average Hero Rating

Use number cards and simple tables only.

Charts are intentionally excluded.

---

## Explicitly Out of Scope

The Admin Dashboard intentionally excludes:

- Charts
- Marketing Analytics
- Push Notifications
- Coupon Management
- CMS
- Announcements
- Customer Support
- Audit Logs
- Role Management

These features are intentionally deferred until the core consumer product has been validated.
