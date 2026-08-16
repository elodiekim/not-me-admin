export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
