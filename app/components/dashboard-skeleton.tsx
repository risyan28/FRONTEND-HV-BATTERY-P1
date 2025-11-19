"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-50">
      {/* Skeleton Header - matches your existing header */}
      <div className="flex h-14 w-full items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500 px-4">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 bg-white/20" />
          <Skeleton className="ml-4 h-5 w-32 bg-white/20" />
        </div>
        <Skeleton className="h-5 w-20 bg-white/20" />
        <div className="flex items-center">
          <div className="mr-4 text-right">
            <Skeleton className="h-4 w-24 bg-white/20" />
            <Skeleton className="mt-1 h-3 w-32 bg-white/20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* First section title */}
        <Skeleton className="mb-4 h-6 w-48" />

        {/* Stats cards - 4 cards in a row */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from<number>({ length: 4 }).map((_, i) => (
            <Skeleton key={`stat-${i}`} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        {/* Menu section title */}
        <Skeleton className="mb-4 h-6 w-24" />

        {/* Menu grid - 7 items per row, 2 rows */}
        <div className="mb-4 grid grid-cols-4 gap-4 md:grid-cols-7">
          {Array.from<number>({ length: 7 }).map((_, i) => (
            <Skeleton key={`menu-1-${i}`} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="mb-8 grid grid-cols-4 gap-4 md:grid-cols-7">
          {Array.from<number>({ length: 7 }).map((_, i) => (
            <Skeleton key={`menu-2-${i}`} className="h-16 w-full rounded-lg" />
          ))}
        </div>

        {/* Updates section title and view all */}
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Updates cards - 4 cards in a row */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from<number>({ length: 4 }).map((_, i) => (
            <Skeleton key={`update-${i}`} className="h-52 w-full rounded-lg" />
          ))}
        </div>

        {/* Banner */}
        <Skeleton className="mb-8 h-36 w-full rounded-xl" />
      </div>

      {/* Skeleton Footer */}
      <div className="h-10 w-full bg-white">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
