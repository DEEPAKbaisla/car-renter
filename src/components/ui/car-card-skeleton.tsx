import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-[250px] bg-gray-200 dark:bg-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-600/50 to-transparent animate-shimmer" />
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            {/* Badge skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
          <div className="text-right space-y-1">
            {/* Price skeleton */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </CardFooter>
    </Card>
  );
}

export function CarCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}
