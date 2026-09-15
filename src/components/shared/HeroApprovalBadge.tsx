// Only ever rendered for the pending case — an approved hero shows nothing
// here (same "only flag what's noteworthy" reasoning as AdminBadge).
export function HeroApprovalBadge() {
  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
      Pending Approval
    </span>
  );
}
