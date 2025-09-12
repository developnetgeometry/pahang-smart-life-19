import React, { Suspense, memo } from 'react';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponentWrapper Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <p>Something went wrong loading this component.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const LazyComponentWrapper = memo(({
  children,
  fallback = <DashboardSkeleton />,
  errorBoundary = true,
}: LazyComponentWrapperProps) => {
  const content = (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );

  if (errorBoundary) {
    return <ErrorBoundary fallback={fallback}>{content}</ErrorBoundary>;
  }

  return content;
});

LazyComponentWrapper.displayName = 'LazyComponentWrapper';

// Higher-order component for creating lazy-loaded components
export function withLazyLoading<P = {}>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return memo((props: P) => (
    <LazyComponentWrapper fallback={fallback}>
      <LazyComponent {...props as any} />
    </LazyComponentWrapper>
  ));
}

// Factory for creating lazy-loaded pages
export function createLazyPage(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  const LazyPage = React.lazy(importFn);
  
  return memo((props: any) => (
    <LazyComponentWrapper>
      <LazyPage {...props} />
    </LazyComponentWrapper>
  ));
}