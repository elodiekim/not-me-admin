# NotMe Admin

Internal administration dashboard for [NotMe](https://github.com/elodiekim/not-me) — a lightweight operational tool for monitoring missions, managing users, and cancelling stuck requests. Not a consumer-facing product, and not publicly accessible (see [PRODUCT.md](PRODUCT.md)).

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Vite + React |
| Routing | React Router |
| Styling | Tailwind CSS + shadcn/ui |
| Server state | TanStack Query |
| Backend | Supabase (Auth / Database) — no custom backend, RLS-only |
| Language | TypeScript |

See [CLAUDE.md](CLAUDE.md) for the reasoning behind the no-backend architecture.

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
# (same Supabase project as the consumer app — notme-app/.env has these values)

npm run dev
```

Other useful scripts:

```bash
npm run build   # tsc -b && vite build
```

### Admin access

Only accounts with `profiles.is_admin = true` can sign in. There's no self-service way to become an admin — assign it manually via SQL against the Supabase project:

```sql
update profiles
set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

The account must already exist (sign up through the consumer app first).

## Project Structure

```
src/
  components/  # Shared UI (shadcn primitives + cross-feature components)
  features/    # Screens and their data hooks, grouped by domain
  hooks/       # Cross-cutting React hooks (e.g. useAuth)
  lib/         # Supabase client and small framework-agnostic utilities
  providers/   # App-wide context providers (auth)
  routes/      # Route guards
  types/       # Shared TypeScript types
```

## Documentation

For deeper detail, see:

- [PRODUCT.md](PRODUCT.md) — product vision and scope (source of truth)
- [DESIGN.md](DESIGN.md) — shared design system (consumer app + admin)
- [ADMIN.md](ADMIN.md) — full feature spec for this dashboard
- [CLAUDE.md](CLAUDE.md) — development rules and architecture notes
