import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailSkeleton() {
  return (
    <>
      {/* Banner */}
      <Skeleton className="h-64 w-full md:h-80" />

      <div className="container relative -mt-20 pb-20">
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-36" />
        </div>
        <Skeleton className="mt-3 h-10 w-2/3" />
        <Skeleton className="mt-2 h-5 w-48" />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-10">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div>
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="mt-3 h-3 w-full rounded-full" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Skeleton className="h-5 w-36" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
