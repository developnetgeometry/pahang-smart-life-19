import React from 'react';
import { useFloorPlanMigrations } from '@/hooks/use-floor-plan-migrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Calendar, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const FloorPlanMigrationHistory: React.FC = () => {
  const { migrations, loading, restoreFromBackup } = useFloorPlanMigrations();

  const handleRestore = async (migrationId: string) => {
    if (confirm('Are you sure you want to restore unit coordinates from this backup? This will overwrite current positions.')) {
      await restoreFromBackup(migrationId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading migration history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <History className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Floor Plan Migration History</h2>
      </div>

      {migrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Migrations</h3>
              <p>No floor plan migrations have been performed yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {migrations.map((migration) => (
            <Card key={migration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {migration.from_floor_plan 
                        ? `${migration.from_floor_plan.name} → ${migration.to_floor_plan?.name}`
                        : `New Floor Plan: ${migration.to_floor_plan?.name}`
                      }
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(migration.performed_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{migration.performed_by_profile?.full_name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {migration.units_affected} units affected
                    </Badge>
                    <Badge variant={migration.migration_type === 'layout_change' ? 'destructive' : 'default'}>
                      {migration.migration_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {migration.notes && (
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{migration.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <div className="text-sm">
                      <span className="font-medium">Migration Data:</span>
                      <ul className="mt-1 space-y-1 text-muted-foreground">
                        <li>• Backup created: {migration.migration_data?.unit_backup ? 'Yes' : 'No'}</li>
                        <li>• Units backed up: {migration.migration_data?.unit_backup?.length || 0}</li>
                        {migration.from_floor_plan && (
                          <li>• From version: v{migration.from_floor_plan.version}</li>
                        )}
                        {migration.to_floor_plan && (
                          <li>• To version: v{migration.to_floor_plan.version}</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {migration.migration_data?.unit_backup && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(migration.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore from Backup
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};