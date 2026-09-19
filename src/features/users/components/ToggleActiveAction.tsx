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
import { ActiveBadge } from '@/components/shared/ActiveBadge';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { DeactivatedReason } from '@/types/user';
import { useSetUserActive } from '../hooks';

// Same pill shape as ActiveBadge, but interactive — the badge itself is the
// button (hover ring, click to act) instead of a separate icon or label next
// to a static badge.
const pillClass =
  'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-shadow hover:ring-2 hover:ring-ring disabled:pointer-events-none disabled:opacity-50';

const chevron = <span className="text-[0.6rem] opacity-60">▾</span>;

export function ToggleActiveAction({
  userId,
  isActive,
  deactivatedReason,
}: {
  userId: string;
  isActive: boolean;
  deactivatedReason?: DeactivatedReason;
}) {
  const { userId: currentUserId } = useAuth();
  const [open, setOpen] = useState(false);
  const setActive = useSetUserActive(userId);

  // No self-service path either way (server-enforced) — plain, non-clickable badge.
  if (userId === currentUserId) {
    return <ActiveBadge isActive={isActive} deactivatedReason={deactivatedReason} />;
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
            <button
              type="button"
              title="Click to disable this account"
              className={cn(pillClass, 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300')}
            >
              Active {chevron}
            </button>
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
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        title="Click to re-enable this account"
        onClick={() => setActive.mutate(true)}
        disabled={setActive.isPending}
        className={cn(
          pillClass,
          deactivatedReason === 'self'
            ? 'bg-muted text-muted-foreground'
            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        )}
      >
        {deactivatedReason === 'self' ? 'Left the Platform' : 'Disabled'} {chevron}
      </button>
      {setActive.isError && (
        <span role="alert" className="text-xs text-destructive" title={setActive.error.message}>
          Failed
        </span>
      )}
    </span>
  );
}
