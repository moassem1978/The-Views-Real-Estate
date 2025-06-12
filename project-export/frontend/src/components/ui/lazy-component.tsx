import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Type-safe wrapper for React.lazy
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
  id?: string
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback ?? <LoadingFallback id={id} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Default loading state
function LoadingFallback({ id = 'component' }: { id?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[100px] p-4" aria-live="polite" aria-busy="true">
      <div className="space-y-2 w-full" data-testid={`loading-${id}`}>
        <Skeleton className="h-8 w-full max-w-[200px]" />
        <Skeleton className="h-4 w-full max-w-[300px]" />
        <Skeleton className="h-4 w-full max-w-[250px]" />
      </div>
    </div>
  );
}