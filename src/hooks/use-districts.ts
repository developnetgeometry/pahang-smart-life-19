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
      
      // Fetch districts with community count
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('*')
        .order('name');

      if (districtsError) {
        console.error('Error fetching districts:', districtsError);
        toast.error('Failed to fetch districts');
        return;
      }

      // Fetch community counts for each district
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('district_id');

      if (communitiesError) {
        console.error('Error fetching communities:', communitiesError);
      }

      // Count communities per district
      const communityCounts: Record<string, number> = {};
      if (communitiesData) {
        communitiesData.forEach(community => {
          if (community.district_id) {
            communityCounts[community.district_id] = (communityCounts[community.district_id] || 0) + 1;
          }
        });
      }

      // Merge district data with community counts
      const districtsWithCounts = (districtsData || []).map(district => ({
        ...district,
        communities_count: communityCounts[district.id] || 0
      }));

      setDistricts(districtsWithCounts);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to fetch districts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDistricts();
    }
  }, [user, fetchDistricts]);

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

  return {
    districts,
    loading,
    updateDistrict,
    refetchDistricts: fetchDistricts
  };
};