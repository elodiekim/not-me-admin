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
import { useAuth } from '@/hooks/useAuth';
import { useSetUserActive } from '../hooks';

export function ToggleActiveAction({ userId, isActive }: { userId: string; isActive: boolean }) {
  const { userId: currentUserId } = useAuth();
  const setActive = useSetUserActive(userId);

  if (userId === currentUserId) {
    return <p className="text-sm text-muted-foreground">You can't change your own account status.</p>;
  }

  if (isActive) {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="destructive" size="sm">
              Disable Account
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable this account?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to create new requests or accept missions as a hero. Missions already in progress
              are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <AlertDialogAction onClick={() => setActive.mutate(false)} disabled={setActive.isPending}>
              {setActive.isPending ? 'Disabling…' : 'Yes, disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setActive.mutate(true)} disabled={setActive.isPending}>
      {setActive.isPending ? 'Enabling…' : 'Enable Account'}
    </Button>
  );
}
