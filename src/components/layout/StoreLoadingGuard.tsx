"use client";

import { useAppStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreLoadingGuard({ children }: { children: React.ReactNode }) {
  const isLoading = useAppStore((s) => s.isLoading);

  if (!isLoading) return <>{children}</>;

  return (
    <div className="animate-fade-in">
      {/* Header placeholder */}
      <div className="h-14 mb-6 flex items-center gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* KPI cards — 2x2 mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card shadow-[0_1px_3px_oklch(0_0_0/0.07),0_1px_2px_oklch(0_0_0/0.04)] p-4 space-y-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
