import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

export function NotFoundScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <div>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">There's nothing here.</p>
      </div>
      <Link to="/" className={buttonVariants({})}>
        Back to Dashboard
      </Link>
    </div>
  );
}
