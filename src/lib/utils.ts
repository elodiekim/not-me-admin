import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The read-only demo account (notme-app's 0032 migration) fails every write
// with an opaque RLS error ("new row violates row-level security policy...").
// Mutation error displays should show this instead whenever the signed-in
// admin is that account, since that's always the real cause.
export const DEMO_READONLY_ERROR = "This is the read-only demo account — writes are blocked."

export function mutationErrorMessage(isDemoReadonly: boolean, error: Error) {
  return isDemoReadonly ? DEMO_READONLY_ERROR : error.message
}
