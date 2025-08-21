import { AccessControlDebugPanel } from '@/components/debug/AccessControlDebugPanel';

export default function AccessControlTest() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Access Control Testing
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing interface for the hierarchical access control system.
            Use this page to validate role-based permissions, geographic scope, and functional specialization.
          </p>
        </div>
        
        <AccessControlDebugPanel />
      </div>
    </div>
  );
}