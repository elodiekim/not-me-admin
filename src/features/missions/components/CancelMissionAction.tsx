import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useCancelMission } from '../hooks';
import type { MissionStatus } from '@/types/mission';

export function CancelMissionAction({ missionId, status }: { missionId: string; status: MissionStatus }) {
  const cancelMission = useCancelMission(missionId);

  if (status === 'completed' || status === 'cancelled') {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            Cancel Mission
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this mission?</AlertDialogTitle>
          <AlertDialogDescription>
            Intended only for abandoned or stuck missions. This cannot be undone from here — the requester would
            need to submit a new request.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep waiting</AlertDialogCancel>
          <AlertDialogAction onClick={() => cancelMission.mutate()} disabled={cancelMission.isPending}>
            {cancelMission.isPending ? 'Cancelling…' : 'Yes, cancel'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
