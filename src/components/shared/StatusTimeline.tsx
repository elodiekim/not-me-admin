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

interface StatusTimelineProps {
  status: MissionStatus;
  cancelledReason?: MissionCancelledReason;
  // updated_at at the moment status became 'cancelled' — the missions table
  // has no separate cancelled_at column, but the set_updated_at trigger
  // fires on every status change, so this is reliably that moment.
  cancelledAt?: string;
}

export function StatusTimeline({ status, cancelledReason, cancelledAt }: StatusTimelineProps) {
  if (status === 'cancelled') {
    const label = cancelledReason ? CANCELLED_REASON_LABELS[cancelledReason] : 'This mission was cancelled';
    return (
      <div className="flex items-center gap-3">
        <StatusBadge status="cancelled" />
        <div>
          <div className="text-sm text-foreground">{label}</div>
          {cancelledAt && <div className="text-xs text-muted-foreground">{formatDateTime(cancelledAt)}</div>}
        </div>
      </div>
    );
  }

  const currentIndex = STEP_ORDER.indexOf(status) + 1; // +1 to account for the synthetic "created" step

  return (
    <ol className="flex flex-col gap-3">
      {TIMELINE_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${isDone ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`text-sm ${isDone ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
