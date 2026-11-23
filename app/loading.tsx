// Shown instantly while a page loads its data from Supabase.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-cocoa-200" />
        <div className="h-4 w-80 max-w-full rounded bg-cocoa-100" />
      </div>
      <div className="card space-y-3">
        <div className="h-5 w-36 rounded bg-cocoa-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-cocoa-100" />
          ))}
        </div>
      </div>
      <div className="card space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-5 rounded bg-cocoa-100" />
        ))}
      </div>
      <p className="text-center text-sm text-cocoa-500">Loading…</p>
    </div>
  );
}
