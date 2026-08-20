import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ActiveBadge } from '@/components/shared/ActiveBadge';
import { ErrorState } from '@/components/shared/ErrorState';
import { useUser } from './hooks';
import { ToggleActiveAction } from './components/ToggleActiveAction';

export function UserDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUser(id!);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !user) {
    return <ErrorState message="Couldn't load this user." />;
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
            {user.name}
            <ActiveBadge isActive={user.isActive} />
          </h1>
        </div>
        <ToggleActiveAction userId={user.id} isActive={user.isActive} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Phone: </span>
            {user.phone ?? 'No phone on file'}
          </div>
          <div>
            <span className="text-muted-foreground">Joined: </span>
            {new Date(user.joinDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">As Requester</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div className="flex gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Total Requests</div>
              <div className="text-lg font-semibold">{user.asRequester.totalRequests}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Cancellations</div>
              <div className="text-lg font-semibold">{user.asRequester.cancellations}</div>
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Mission History</div>
            {user.asRequester.missionHistory.length === 0 ? (
              <p className="text-muted-foreground">No missions yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {user.asRequester.missionHistory.map((mission) => (
                  <li key={mission.id}>
                    <Link to={`/missions/${mission.id}`} className="hover:underline">
                      {mission.category} · {mission.status} · {new Date(mission.createdAt).toLocaleDateString()}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Reviews Written</div>
            {user.asRequester.reviewsWritten.length === 0 ? (
              <p className="text-muted-foreground">No reviews written yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {user.asRequester.reviewsWritten.map((review) => (
                  <li key={review.id}>
                    ★ {review.rating} for {review.heroName}
                    {review.comment ? ` — "${review.comment}"` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">As Hero</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Missions Completed</div>
            <div className="text-lg font-semibold">{user.asHero.missionsCompleted}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Hero Rating</div>
            <div className="text-lg font-semibold">
              {user.asHero.heroRating != null ? `★ ${user.asHero.heroRating.toFixed(1)}` : '—'}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                ({user.asHero.heroReviewCount} reviews)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
