export function ErrorState({ message = 'Something went wrong.' }: { message?: string }) {
  return <p className="text-sm text-destructive">{message}</p>;
}
