import { StatusBadge } from '@/components/shared/StatusBadge';
import { TIMELINE_STEPS, type MissionCancelledReason, type MissionStatus } from '@/types/mission';

const STEP_ORDER: MissionStatus[] = ['requested', 'accepted', 'on_the_way', 'arrived', 'completed'];

const CANCELLED_REASON_LABELS: Record<Exclude<MissionCancelledReason, null>, string> = {
  requester: 'Cancelled by the requester',
  timeout: 'Cancelled — timed out waiting for a hero',
  admin: 'Cancelled by an admin',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRelativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

interface StatusTimelineProps {
  status: MissionStatus;
  createdAt: string;
  // Last time the mission's status changed — the missions table has no
  // per-step history, just this one timestamp for whatever the current
  // status is. Reused for two purposes: the cancellation moment (cancelled
  // is terminal, so this is unambiguous), and the moment the mission
  // entered its current in-progress step. Steps already passed through
  // (e.g. Accepted, if the mission has since moved to Arrived) have no
  // recoverable timestamp — the value gets overwritten on every transition.
  updatedAt: string;
  cancelledReason?: MissionCancelledReason;
}

export function StatusTimeline({ status, createdAt, updatedAt, cancelledReason }: StatusTimelineProps) {
  if (status === 'cancelled') {
    const label = cancelledReason ? CANCELLED_REASON_LABELS[cancelledReason] : 'This mission was cancelled';
    return (
      <div className="flex items-center gap-3">
        <StatusBadge status="cancelled" />
        <div>
          <div className="text-sm text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{formatDateTime(updatedAt)}</div>
        </div>
      </div>
    );
  }

  const currentIndex = STEP_ORDER.indexOf(status) + 1; // +1 to account for the synthetic "created" step

  return (
    <ol className="flex flex-col gap-3">
      {TIMELINE_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;
        // Only Created (always known) and the current step (updated_at is
        // necessarily when it got here) have a real timestamp — anything
        // already passed through has none.
        const timestamp = index === 0 ? createdAt : isCurrent ? updatedAt : null;

        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isCurrent
                  ? 'bg-[#FFB400] ring-4 ring-[#FFB400]/25'
                  : isDone
                    ? 'bg-primary'
                    : 'bg-muted'
              }`}
            />
            <div>
              <div className={`text-sm ${isDone ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </div>
              {timestamp && (
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(timestamp)}
                  {isCurrent && ` · ${formatRelativeTime(timestamp)}`}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
