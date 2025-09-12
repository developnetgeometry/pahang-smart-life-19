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

  // Commented out due to missing RPC function - not used in DistrictDetail.tsx
  // const fetchDistricts = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const { data, error } = await supabase.rpc("get_districts_with_stats");
  //     // ... rest of implementation
  //   } catch (error) {
  //     console.error("An unexpected error occurred:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

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
    refetchDistricts: () => {}, // Placeholder - not used
  };
};
