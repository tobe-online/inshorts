const Block = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-[#ededea] ${className}`} />
);

export default function ProfileSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading profile">
      <Block className="h-7 w-72" />
      <div className="card p-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="flex gap-4">
            <Block className="h-20 w-16" />
            <div className="flex-1 space-y-2">
              <Block className="h-5 w-32" />
              <Block className="h-3 w-40" />
              <Block className="h-3 w-36" />
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Block className="h-3 w-24" />
              <Block className="h-5 w-40" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card space-y-4 p-6">
            <Block className="h-4 w-40" />
            <Block className="h-28 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card space-y-4 p-6">
            <Block className="h-4 w-44" />
            <Block className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
