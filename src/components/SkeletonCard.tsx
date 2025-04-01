
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="border p-4 rounded-md space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
};
