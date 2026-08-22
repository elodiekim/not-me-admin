import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
}

// A failed query already shows its own inline error (see ErrorState) — this
// is the backstop for anything that isn't that: an unexpected render
// exception anywhere in the tree, which would otherwise unmount everything
// and leave a blank white page. Must be a class component; React has no
// hook-based equivalent.
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Try reloading the page. If this keeps happening, check the browser console.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
