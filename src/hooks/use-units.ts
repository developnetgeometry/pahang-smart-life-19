import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Unit {
  id: string;
  unit_number: string;
  owner_name: string;
  unit_type: 'residential' | 'commercial' | 'facility';
  address?: string;
  community_id?: string;
  district_id?: string;
  floor_plan_id?: string;
  coordinates_x: number;
  coordinates_y: number;
  width?: number;
  height?: number;
  phone_number?: string;
  email?: string;
  occupancy_status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUnits = useCallback(async (floorPlanId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('units')
        .select('*')
        .order('unit_number');

      // Filter by floor plan if specified
      if (floorPlanId) {
        query = query.eq('floor_plan_id', floorPlanId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching units:', error);
        toast.error('Failed to fetch units');
        setUnits([]);
        return;
      }

      // Successfully fetched data, even if it's empty
      const mappedUnits = (data || []).map(unit => ({
        ...unit,
        unit_type: unit.unit_type as 'residential' | 'commercial' | 'facility'
      }));
      
      setUnits(mappedUnits);
      
      // Log for debugging
      console.log(`Fetched ${mappedUnits.length} units${floorPlanId ? ` for floor plan ${floorPlanId}` : ''}`);
      
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Failed to fetch units');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUnit = async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create units');
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
        .from('units')
        .insert([{
          ...unitData,
          created_by: user.id,
          district_id: profile.district_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating unit:', error);
        if (error.code === '42501') {
          toast.error('You do not have permission to create units. Please check your role permissions.');
        } else {
          toast.error('Failed to create unit');
        }
        return false;
      }

      setUnits(prev => [...prev, {
        ...data,
        unit_type: data.unit_type as 'residential' | 'commercial' | 'facility'
      }]);
      toast.success('Unit created successfully');
      return true;
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Failed to create unit');
      return false;
    }
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating unit:', error);
        toast.error('Failed to update unit');
        return false;
      }

      setUnits(prev => prev.map(unit => unit.id === id ? {
        ...data,
        unit_type: data.unit_type as 'residential' | 'commercial' | 'facility'
      } : unit));
      toast.success('Unit updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Failed to update unit');
      return false;
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting unit:', error);
        toast.error('Failed to delete unit');
        return false;
      }

      setUnits(prev => prev.filter(unit => unit.id !== id));
      toast.success('Unit deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete unit');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnits();
    }
  }, [user, fetchUnits]);

  const fetchUnitsByFloorPlan = useCallback((floorPlanId: string) => fetchUnits(floorPlanId), [fetchUnits]);

  return {
    units,
    loading,
    createUnit,
    updateUnit,
    deleteUnit,
    refetchUnits: fetchUnits,
    fetchUnitsByFloorPlan
  };
};