import { MISSION_STATUS_LABELS, type MissionStatus } from '@/types/mission';

// Searching/Accepted/Arrived/Completed/Cancelled colors are DESIGN.md's status
// color table. On The Way has no assigned color there yet — indigo picked as a
// reasonable placeholder between Accepted's blue and Arrived's purple.
const STATUS_STYLES: Record<MissionStatus, string> = {
  requested: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  on_the_way: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  arrived: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
