import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span className={`block rounded-md bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-pulse ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 border border-slate-200/60 rounded-2xl flex flex-col gap-2.5">
      <Skeleton className="h-3 w-[60%]" />
      <Skeleton className="h-8 w-[40%]" />
      <Skeleton className="h-2.5 w-[70%]" />
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="w-4 h-4 rounded-full" />
      <div className="flex-1 flex flex-col gap-1">
        <Skeleton className="h-3 w-[55%]" />
        <Skeleton className="h-2.5 w-[30%]" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}
