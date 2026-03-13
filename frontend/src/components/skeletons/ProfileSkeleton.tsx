import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2 text-center md:text-left">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <Skeleton className="h-10 w-80 rounded-lg" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
