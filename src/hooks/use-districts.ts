import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

      // Fetch districts with community counts using a direct query
      const { data, error } = await supabase
        .from('districts')
        .select(`
          *,
          communities:communities(count)
        `);

      if (error) {
        console.error("Error fetching districts with stats:", error);
        toast.error("Failed to fetch districts");
        setDistricts([]); // Set to empty array on error
        return;
      }

      // Transform the data to include community count
      const formattedData = data?.map((d: any) => ({
        ...d,
        // Ensure population and communities_count are numbers
        population: d.population ?? 0,
        communities_count: d.communities?.[0]?.count ?? 0,
      })) || [];

      setDistricts(formattedData as District[]);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error("An unexpected error occurred while fetching districts.");
      setDistricts([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDistricts();
    }
  }, [user?.id, fetchDistricts]);

  const updateDistrict = async (id: string, updates: Partial<District>) => {
    try {
      const { data, error } = await supabase
        .from("districts")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating district:", error);
        toast.error("Failed to update district");
        return false;
      }

      setDistricts((prev) =>
        prev.map((district) => (district.id === id ? data : district))
      );
      toast.success("District updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating district:", error);
      toast.error("Failed to update district");
      return false;
    }
  };

  return {
    districts,
    loading,
    updateDistrict,
    refetchDistricts: fetchDistricts,
  };
};
