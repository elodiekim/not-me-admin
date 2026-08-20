import { useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const setActive = useSetUserActive(userId);

  if (userId === currentUserId) {
    return <p className="text-sm text-muted-foreground">You can't change your own account status.</p>;
  }

  if (isActive) {
    function handleConfirm() {
      setActive.mutate(false, { onSuccess: () => setOpen(false) });
    }

    return (
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setActive.reset();
        }}
      >
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
          {setActive.isError && (
            <p role="alert" className="text-sm text-destructive">
              Couldn't disable this account: {setActive.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={setActive.isPending}>
              {setActive.isPending ? 'Disabling…' : 'Yes, disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setActive.mutate(true)}
        disabled={setActive.isPending}
      >
        {setActive.isPending ? 'Enabling…' : 'Enable Account'}
      </Button>
      {setActive.isError && (
        <p role="alert" className="text-xs text-destructive">
          Couldn't enable this account: {setActive.error.message}
        </p>
      )}
    </div>
  );
}
