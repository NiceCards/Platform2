export const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-4">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-9 w-full" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonRows = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="card flex items-center gap-4 p-4">
        <div className="skeleton h-14 w-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="skeleton h-8 w-24" />
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ className = 'h-4 w-24' }) => <div className={`skeleton ${className}`} />;
