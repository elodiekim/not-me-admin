import type { DeactivatedReason } from '@/types/user';

interface ActiveBadgeProps {
  isActive: boolean;
  deactivatedReason?: DeactivatedReason;
}

// Self-deactivated and admin-disabled both mean "not active," but they're
// different enough that the badge itself should say which — not a status
// dot plus a parenthetical, which relies on reading the fine print. Left
// the Platform is neutral/gray (their own choice); Disabled is red (an
// admin acted on them).
export function ActiveBadge({ isActive, deactivatedReason }: ActiveBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
        Active
      </span>
    );
  }

  if (deactivatedReason === 'self') {
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Left the Platform
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
      Disabled
    </span>
  );
}
