import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FloorPlan {
  id: string;
  name: string;
  image_url: string;
  district_id?: string;
  is_active: boolean;
  version: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFloorPlans = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFloorPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching floor plans:', error);
        toast.error('Failed to fetch floor plans');
        return;
      }

      setFloorPlans(data || []);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
      toast.error('Failed to fetch floor plans');
    } finally {
      setLoading(false);
    }
  };

  const createFloorPlan = async (floorPlanData: Omit<FloorPlan, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create floor plans');
        return false;
      }

      // Get user's district_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
        toast.error('Unable to fetch your profile information');
        return false;
      }

      if (!profile?.district_id) {
        toast.error('Your profile is missing district information. Please contact an administrator.');
        return false;
      }

      const { data, error } = await supabase
        .from('floor_plans')
        .insert([{
          ...floorPlanData,
          created_by: user.id,
          district_id: profile.district_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating floor plan:', error);
        toast.error('Failed to create floor plan');
        return false;
      }

      setFloorPlans(prev => [data, ...prev]);
      toast.success('Floor plan created successfully');
      return data;
    } catch (error) {
      console.error('Error creating floor plan:', error);
      toast.error('Failed to create floor plan');
      return false;
    }
  };

  const updateFloorPlan = async (id: string, updates: Partial<FloorPlan>) => {
    try {
      const { data, error } = await supabase
        .from('floor_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating floor plan:', error);
        toast.error('Failed to update floor plan');
        return false;
      }

      setFloorPlans(prev => prev.map(plan => plan.id === id ? data : plan));
      toast.success('Floor plan updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating floor plan:', error);
      toast.error('Failed to update floor plan');
      return false;
    }
  };

  const deleteFloorPlan = async (id: string) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('floor_plans')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting floor plan:', error);
        toast.error('Failed to delete floor plan');
        return false;
      }

      // Also update units to remove the floor_plan_id reference
      await supabase
        .from('units')
        .update({ floor_plan_id: null })
        .eq('floor_plan_id', id);

      setFloorPlans(prev => prev.filter(plan => plan.id !== id));
      toast.success('Floor plan deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting floor plan:', error);
      toast.error('Failed to delete floor plan');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFloorPlans();
    }
  }, [user]);

  return {
    floorPlans,
    loading,
    createFloorPlan,
    updateFloorPlan,
    deleteFloorPlan,
    refetchFloorPlans: fetchFloorPlans
  };
};