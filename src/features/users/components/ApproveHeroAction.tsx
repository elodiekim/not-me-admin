import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useApproveHero } from '../hooks';

export function ApproveHeroAction({ userId, heroApproved }: { userId: string; heroApproved: boolean }) {
  const { userId: currentUserId } = useAuth();
  const approve = useApproveHero(userId);

  if (heroApproved) return null;

  // Matches the DB trigger, which blocks this in either direction on your
  // own row — approval is exclusively an admin-on-someone-else call.
  if (userId === currentUserId) {
    return <p className="text-sm text-muted-foreground">You can't approve your own hero status.</p>;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="outline" size="sm" onClick={() => approve.mutate()} disabled={approve.isPending}>
        {approve.isPending ? 'Approving…' : 'Approve as Hero'}
      </Button>
      {approve.isError && (
        <p role="alert" className="text-xs text-destructive">
          Couldn't approve: {approve.error.message}
        </p>
      )}
    </div>
  );
}
