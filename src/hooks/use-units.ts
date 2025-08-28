import { useState, useEffect } from 'react';
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

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('unit_number');

      if (error) {
        console.error('Error fetching units:', error);
        toast.error('Failed to fetch units');
        return;
      }

      setUnits((data || []).map(unit => ({
        ...unit,
        unit_type: unit.unit_type as 'residential' | 'commercial' | 'facility'
      })));
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Failed to fetch units');
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      // Get user's district_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('units')
        .insert([{
          ...unitData,
          created_by: user?.id,
          district_id: profile?.district_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating unit:', error);
        toast.error('Failed to create unit');
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
  }, [user]);

  return {
    units,
    loading,
    createUnit,
    updateUnit,
    deleteUnit,
    refetchUnits: fetchUnits
  };
};