import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface District {
  id: string;
  name: string;
  code?: string;
  area?: number;
  area_km2?: number;
  city?: string;
  country?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  communities_count?: number;
  coordinator_id?: string;
  coordinator_name?: string;
  established_date?: string;
  status?: string;
  district_type?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export const useDistricts = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDistricts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching districts:', error);
        toast.error('Failed to fetch districts');
        return;
      }

      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to fetch districts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDistrict = async (districtData: Omit<District, 'id' | 'created_at' | 'updated_at' | 'coordinator_name'>) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create districts');
        return false;
      }

      const { data, error } = await supabase
        .from('districts')
        .insert([districtData])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating district:', error);
        toast.error('Failed to create district');
        return false;
      }

      setDistricts(prev => [...prev, data]);
      toast.success('District created successfully');
      return true;
    } catch (error) {
      console.error('Error creating district:', error);
      toast.error('Failed to create district');
      return false;
    }
  };

  const updateDistrict = async (id: string, updates: Partial<District>) => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating district:', error);
        toast.error('Failed to update district');
        return false;
      }

      setDistricts(prev => prev.map(district => 
        district.id === id ? data : district
      ));
      toast.success('District updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating district:', error);
      toast.error('Failed to update district');
      return false;
    }
  };

  const deleteDistrict = async (id: string) => {
    try {
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting district:', error);
        toast.error('Failed to delete district');
        return false;
      }

      setDistricts(prev => prev.filter(district => district.id !== id));
      toast.success('District deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting district:', error);
      toast.error('Failed to delete district');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDistricts();
    }
  }, [user, fetchDistricts]);

  return {
    districts,
    loading,
    createDistrict,
    updateDistrict,
    deleteDistrict,
    refetchDistricts: fetchDistricts
  };
};