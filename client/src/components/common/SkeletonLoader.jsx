/**
 * client/src/components/common/SkeletonLoader.jsx
 */
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="skeleton h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
