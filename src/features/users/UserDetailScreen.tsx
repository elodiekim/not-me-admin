import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActiveBadge } from '@/components/shared/ActiveBadge';
import { AdminBadge } from '@/components/shared/AdminBadge';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatPhone } from '@/lib/phone';
import { useUser } from './hooks';
import { ToggleActiveAction } from './components/ToggleActiveAction';

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{children}</div>
    </div>
  );
}

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
            <ActiveBadge isActive={user.isActive} deactivatedReason={user.deactivatedReason} />
            {user.isAdmin && <AdminBadge />}
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
            <span className="text-muted-foreground">Email: </span>
            {user.email ?? 'Unknown'}
          </div>
          <div>
            <span className="text-muted-foreground">Phone: </span>
            {user.phone ? formatPhone(user.phone) : 'No phone on file'}
          </div>
          <div>
            <span className="text-muted-foreground">Joined: </span>
            {new Date(user.joinDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">As Requester</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6">
            <StatTile label="Total Requests">{user.asRequester.totalRequests}</StatTile>
            <StatTile label="Cancellations">{user.asRequester.cancellations}</StatTile>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">As Hero</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6">
            <StatTile label="Missions Completed">{user.asHero.missionsCompleted}</StatTile>
            <StatTile label="Hero Rating">
              {user.asHero.heroRating != null ? `★ ${user.asHero.heroRating.toFixed(1)}` : '—'}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                ({user.asHero.heroReviewCount})
              </span>
            </StatTile>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Mission History</CardTitle>
        </CardHeader>
        <CardContent>
          {user.asRequester.missionHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.asRequester.missionHistory.map((mission) => (
                  <TableRow
                    key={mission.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/missions/${mission.id}`)}
                  >
                    <TableCell>{mission.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={mission.status} />
                    </TableCell>
                    <TableCell>{new Date(mission.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Reviews Written</CardTitle>
        </CardHeader>
        <CardContent>
          {user.asRequester.reviewsWritten.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews written yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hero</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.asRequester.reviewsWritten.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.heroName}</TableCell>
                    <TableCell>★ {review.rating}</TableCell>
                    <TableCell>{review.comment ?? '—'}</TableCell>
                    <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
