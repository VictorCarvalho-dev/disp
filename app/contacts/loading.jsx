export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
