export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div className="glass-card overflow-hidden" key={index}>
          <div className="h-52 animate-pulse bg-white/10" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-white/10" />
            <div className="h-16 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
