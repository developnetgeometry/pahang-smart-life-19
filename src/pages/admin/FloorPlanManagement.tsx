import { FloorPlanManagement } from '@/components/floor-plans/FloorPlanManagement';
import { FloorPlanMigrationHistory } from '@/components/floor-plans/FloorPlanMigrationHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FloorPlanManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList>
          <TabsTrigger value="management">Floor Plan Management</TabsTrigger>
          <TabsTrigger value="history">Migration History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management">
          <FloorPlanManagement />
        </TabsContent>
        
        <TabsContent value="history">
          <FloorPlanMigrationHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}