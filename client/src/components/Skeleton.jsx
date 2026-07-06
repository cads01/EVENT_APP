export default function Skeleton({ className }) {
  return <div className={"bg-zinc-800 rounded-xl animate-pulse " + (className || "w-full h-4")} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-5 space-y-3">
      <Skeleton className="w-full h-40 rounded-xl" />
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/2 h-3" />
      <div className="flex justify-between">
        <Skeleton className="w-16 h-8" />
        <Skeleton className="w-20 h-8" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-16 px-5">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-64 h-10" />
        <Skeleton className="w-96 h-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return <Skeleton className="h-24 rounded-2xl" />;
}
