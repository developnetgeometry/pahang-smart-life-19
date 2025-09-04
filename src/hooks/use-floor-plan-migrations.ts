import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FloorPlanMigration {
  id: string;
  from_floor_plan_id?: string;
  to_floor_plan_id: string;
  migration_type: string;
  units_affected: number;
  migration_data: any;
  performed_by?: string;
  performed_at: string;
  notes?: string;
  created_at: string;
}

export interface MigrationHistory extends FloorPlanMigration {
  from_floor_plan?: {
    name: string;
    version: number;
  };
  to_floor_plan?: {
    name: string;
    version: number;
  };
  performed_by_profile?: {
    full_name: string;
  } | null;
}

export const useFloorPlanMigrations = () => {
  const [migrations, setMigrations] = useState<MigrationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMigrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('floor_plan_migrations')
        .select(`
          *,
          from_floor_plan:floor_plans!from_floor_plan_id(name, version),
          to_floor_plan:floor_plans!to_floor_plan_id(name, version),
          performed_by_profile:profiles!performed_by(full_name)
        `)
        .order('performed_at', { ascending: false });

      if (error) {
        console.error('Error fetching migrations:', error);
        toast.error('Failed to fetch migration history');
        return;
      }

      setMigrations((data || []) as unknown as MigrationHistory[]);
    } catch (error) {
      console.error('Error fetching migrations:', error);
      toast.error('Failed to fetch migration history');
    } finally {
      setLoading(false);
    }
  };

  const createMigration = async (migrationData: Omit<FloorPlanMigration, 'id' | 'performed_at' | 'created_at' | 'performed_by'>) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create migrations');
        return false;
      }

      const { data, error } = await supabase
        .from('floor_plan_migrations')
        .insert([{
          ...migrationData,
          performed_by: user.id
        }])
        .select(`
          *,
          from_floor_plan:floor_plans!from_floor_plan_id(name, version),
          to_floor_plan:floor_plans!to_floor_plan_id(name, version),
          performed_by_profile:profiles!performed_by(full_name)
        `)
        .single();

      if (error) {
        console.error('Error creating migration:', error);
        toast.error('Failed to create migration record');
        return false;
      }

      setMigrations(prev => [data as unknown as MigrationHistory, ...prev]);
      toast.success('Migration record created successfully');
      return data;
    } catch (error) {
      console.error('Error creating migration:', error);
      toast.error('Failed to create migration record');
      return false;
    }
  };

  const restoreFromBackup = async (migrationId: string) => {
    try {
      const migration = migrations.find(m => m.id === migrationId);
      if (!migration || !migration.migration_data?.unit_backup) {
        toast.error('No backup data found for this migration');
        return false;
      }

      const unitBackup = migration.migration_data.unit_backup;
      
      // Restore unit coordinates
      for (const unit of unitBackup) {
        const { error } = await supabase
          .from('units')
          .update({
            coordinates_x: unit.coordinates_x,
            coordinates_y: unit.coordinates_y,
            width: unit.width,
            height: unit.height
          })
          .eq('id', unit.unit_id);

        if (error) {
          console.error('Error restoring unit:', unit.unit_id, error);
        }
      }

      toast.success('Unit coordinates restored from backup');
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      toast.error('Failed to restore from backup');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchMigrations();
    }
  }, [user]);

  return {
    migrations,
    loading,
    createMigration,
    restoreFromBackup,
    refetchMigrations: fetchMigrations
  };
};