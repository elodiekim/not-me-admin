import { StatusBadge } from '@/components/shared/StatusBadge';
import { TIMELINE_STEPS, type MissionStatus } from '@/types/mission';

const STEP_ORDER: MissionStatus[] = ['requested', 'accepted', 'on_the_way', 'arrived', 'completed'];

export function StatusTimeline({ status }: { status: MissionStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status="cancelled" />
        <span className="text-sm text-muted-foreground">This mission was cancelled.</span>
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
