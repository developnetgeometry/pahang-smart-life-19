import React, { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

// Lazy load the heavy InteractiveUnitEditor component
const InteractiveUnitEditor = React.lazy(() => 
  import('./InteractiveUnitEditor').then(module => ({
    default: module.default
  }))
);

interface LazyInteractiveUnitEditorProps {
  imageUrl?: string;
  floorPlanId?: string;
  title?: string;
  showSearch?: boolean;
  isAdminMode?: boolean;
  onFloorPlanChange?: (floorPlanId: string) => void;
}

export default function LazyInteractiveUnitEditor(props: LazyInteractiveUnitEditorProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <InteractiveUnitEditor {...props} />
    </Suspense>
  );
}