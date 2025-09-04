import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SmartImage } from '@/components/ui/dynamic-image';
import { AlertTriangle, CheckCircle, Users, ArrowRight, History } from 'lucide-react';
import { toast } from 'sonner';

interface FloorPlan {
  id: string;
  name: string;
  image_url: string;
  version: number;
  created_at?: string;
}

interface Unit {
  id: string;
  unit_number: string;
  owner_name: string;
  coordinates_x: number;
  coordinates_y: number;
  width?: number;
  height?: number;
}

interface FloorPlanMigrationWizardProps {
  floorPlan: FloorPlan;
  onClose: () => void;
}

type MigrationStep = 'warning' | 'backup' | 'complete';

export const FloorPlanMigrationWizard: React.FC<FloorPlanMigrationWizardProps> = ({
  floorPlan,
  onClose
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<MigrationStep>('warning');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [notes, setNotes] = useState('');
  const [backupCreated, setBackupCreated] = useState(false);

  useEffect(() => {
    fetchUnitsForFloorPlan();
  }, [floorPlan.id]);

  const fetchUnitsForFloorPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, unit_number, owner_name, coordinates_x, coordinates_y, width, height')
        .eq('floor_plan_id', floorPlan.id);

      if (error) {
        console.error('Error fetching units:', error);
        return;
      }

      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const createBackup = async () => {
    if (!user?.id) return false;

    try {
      setLoading(true);

      // Create backup of unit coordinates
      const unitBackupData = units.map(unit => ({
        unit_id: unit.id,
        unit_number: unit.unit_number,
        coordinates_x: unit.coordinates_x,
        coordinates_y: unit.coordinates_y,
        width: unit.width,
        height: unit.height,
        owner_name: unit.owner_name
      }));

      const { error: backupError } = await supabase
        .from('unit_coordinate_backups')
        .insert({
          floor_plan_id: floorPlan.id,
          unit_data: unitBackupData,
          backup_reason: 'pre_migration_backup',
          created_by: user.id
        });

      if (backupError) {
        console.error('Error creating backup:', backupError);
        toast.error('Failed to create backup');
        return false;
      }

      setBackupCreated(true);
      toast.success('Unit coordinates backed up successfully');
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const proceedToBackup = () => {
    setCurrentStep('backup');
  };

  const completeBackup = async () => {
    const success = await createBackup();
    if (success) {
      setCurrentStep('complete');
    }
  };

  const renderWarningStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-orange-600">
        <AlertTriangle className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Migration Warning</h3>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Important: Floor Plan Migration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-700">
            Changing the floor plan image may affect existing unit positions. Here's what will happen:
          </p>
          <ul className="space-y-2 text-sm text-orange-700">
            <li>• <strong>Unit coordinates will be preserved</strong> but may not align with the new layout</li>
            <li>• <strong>{units.length} units</strong> are currently positioned on this floor plan</li>
            <li>• A backup will be created automatically before any changes</li>
            <li>• You'll need to manually reposition units if the layout has changed significantly</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Affected Units ({units.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {units.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {units.map(unit => (
                <Badge key={unit.id} variant="secondary" className="justify-start">
                  {unit.unit_number} - {unit.owner_name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No units positioned on this floor plan</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={proceedToBackup} className="bg-orange-600 hover:bg-orange-700">
          Proceed with Migration
        </Button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-blue-600">
        <History className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Create Backup</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Floor Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative h-48">
              <SmartImage
                src={floorPlan.image_url}
                alt={floorPlan.name}
                className="w-full h-full object-contain rounded border"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{floorPlan.name}</p>
                <p className="text-sm text-muted-foreground">Version {floorPlan.version}</p>
              </div>
              <Badge>{units.length} Units</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="notes">Migration Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this migration (e.g., reason for change, layout differences)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={completeBackup} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Creating Backup...' : 'Create Backup & Continue'}
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Backup Complete</h3>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Backup Created Successfully</h3>
              <p className="text-green-700">
                Unit coordinates have been safely backed up. You can now proceed with updating the floor plan image.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">1</span>
              <span>Update the floor plan image in the main management interface</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">2</span>
              <span>Check that existing unit positions still align with the new layout</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">3</span>
              <span>Manually reposition any units that are misaligned</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">4</span>
              <span>The backup can be restored if needed from the migration history</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Floor Plan Migration Wizard</DialogTitle>
        </DialogHeader>

        {currentStep === 'warning' && renderWarningStep()}
        {currentStep === 'backup' && renderBackupStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
};