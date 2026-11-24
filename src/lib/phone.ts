// Shared by anything that searches phone numbers: stored formatting isn't
// consistent (some hyphenated, some not — see notme-app's 0016 migration,
// which normalizes new writes but doesn't touch old ones), so a literal
// ILIKE match on the raw column misses real matches whenever the search
// term's punctuation doesn't line up with what's stored.
export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// Display-only formatting — never touches the stored value. Phone numbers
// aren't stored in one consistent format (search already handles that by
// comparing digits-only), so this only formats the clear cases and leaves
// anything ambiguous as-is rather than guessing.
// phone lives in its own table now (profile_private, see notme-app's 0035
// migration) — a self-or-admin-only RLS policy, split out of profiles
// because that table's own SELECT policy is intentionally public (a trust
// signal for name/hero_rating/etc.) and RLS can't carve one column out of
// an otherwise-public row. The Supabase client has no generated Database
// types, so every embed of it comes back typed as an array regardless of
// the real one-to-one relationship (profile_private.id is a unique FK to
// profiles.id) — this casts through the real runtime shape instead of
// indexing into a phantom array, the same footgun every embed in this app
// already works around locally.
export function extractPhone(rawProfilePrivate: unknown): string | null {
  const profilePrivate = rawProfilePrivate as unknown as { phone: string | null } | null;
  return profilePrivate?.phone ?? null;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return digits.startsWith('02')
      ? `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
      : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}
