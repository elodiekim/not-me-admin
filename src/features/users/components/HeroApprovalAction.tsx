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
import { HeroApprovalBadge } from '@/components/shared/HeroApprovalBadge';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useSetHeroApproved } from '../hooks';

// Same pill shape as HeroApprovalBadge, but interactive — the badge itself is
// the button (hover ring, click to act) instead of a separate icon or label
// next to a static badge.
const pillClass =
  'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-shadow hover:ring-2 hover:ring-ring disabled:pointer-events-none disabled:opacity-50';

const chevron = <span className="text-[0.6rem] opacity-60">▾</span>;

export function HeroApprovalAction({ userId, heroApproved }: { userId: string; heroApproved: boolean }) {
  const { userId: currentUserId } = useAuth();
  const [open, setOpen] = useState(false);
  const setApproved = useSetHeroApproved(userId);

  // Matches the DB trigger, which blocks this in either direction on your
  // own row — plain, non-clickable badge.
  if (userId === currentUserId) {
    return <HeroApprovalBadge heroApproved={heroApproved} />;
  }

  if (heroApproved) {
    function handleConfirm() {
      setApproved.mutate(false, { onSuccess: () => setOpen(false) });
    }

    return (
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setApproved.reset();
        }}
      >
        <AlertDialogTrigger
          render={
            <button
              type="button"
              title="Click to revoke hero approval"
              className={cn(pillClass, 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300')}
            >
              Hero Approved {chevron}
            </button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke hero approval?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to accept new missions as a hero. Missions already in progress are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {setApproved.isError && (
            <p role="alert" className="text-sm text-destructive">
              Couldn't revoke approval: {setApproved.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Keep approved</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={setApproved.isPending}>
              {setApproved.isPending ? 'Revoking…' : 'Yes, revoke'}
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
        title="Click to approve as hero"
        onClick={() => setApproved.mutate(true)}
        disabled={setApproved.isPending}
        className={cn(pillClass, 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300')}
      >
        Pending Approval {chevron}
      </button>
      {setApproved.isError && (
        <span role="alert" className="text-xs text-destructive" title={setApproved.error.message}>
          Failed
        </span>
      )}
    </span>
  );
}
