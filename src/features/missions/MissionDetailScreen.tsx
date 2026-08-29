import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusTimeline } from '@/components/shared/StatusTimeline';
import { formatPhone } from '@/lib/phone';
import type { MissionParty } from '@/types/mission';
import { useMission } from './hooks';
import { CancelMissionAction } from './components/CancelMissionAction';

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

function PartyInfo({ label, party }: { label: string; party: MissionParty | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm">
        {party ? (
          <>
            <span className="font-medium">{party.name}</span>
            <span className="text-muted-foreground">
              {party.phone ? formatPhone(party.phone) : 'No phone on file'}
            </span>
            {label === 'Hero Information' && (
              <span className="text-muted-foreground">
                {party.heroRating != null ? `★ ${party.heroRating.toFixed(1)}` : 'No rating yet'} ·{' '}
                {party.heroReviewCount} reviews
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">No hero assigned yet.</span>
        )}
      </CardContent>
    </Card>
  );
}

export function MissionDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mission, isLoading, isError, error } = useMission(id!);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !mission) {
    const detail = error instanceof Error ? error.message : null;
    return <ErrorState message={detail ? `Couldn't load this mission: ${detail}` : "Couldn't load this mission."} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </button>
          <h1 className="mt-1 flex items-center gap-2 text-lg font-semibold">
            {mission.category}
            <StatusBadge status={mission.status} />
          </h1>
        </div>
        <CancelMissionAction missionId={mission.id} status={mission.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Mission Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InfoField label="Address">{mission.address}</InfoField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoField label="Reward">${mission.rewardAmount.toFixed(2)}</InfoField>
            <InfoField label="Created">{new Date(mission.createdAt).toLocaleString()}</InfoField>
            <InfoField label="Last Updated">{new Date(mission.updatedAt).toLocaleString()}</InfoField>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PartyInfo label="User Information" party={mission.requester} />
        <PartyInfo label="Hero Information" party={mission.hero} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline
            status={mission.status}
            cancelledReason={mission.cancelledReason}
            cancelledAt={mission.updatedAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
