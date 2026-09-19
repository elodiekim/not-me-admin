// Two states, same shape as ActiveBadge — needed so the User Detail header
// always has a badge to anchor the approve/revoke icon action next to,
// regardless of which way hero_approved currently points.
export function HeroApprovalBadge({ heroApproved }: { heroApproved: boolean }) {
  if (heroApproved) {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
        Hero Approved
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
      Pending Approval
    </span>
  );
}
