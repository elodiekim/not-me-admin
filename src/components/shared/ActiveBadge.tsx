export function ActiveBadge({ isActive }: { isActive: boolean }) {
  const className = isActive
    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {isActive ? 'Active' : 'Disabled'}
    </span>
  );
}
