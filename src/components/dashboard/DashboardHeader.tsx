import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, User } from 'lucide-react';

interface UserLocationData {
  unit_number?: string;
  district_name?: string;
  community_name?: string;
}

export const DashboardHeader = () => {
  const { user } = useAuth();
  const [locationData, setLocationData] = useState<UserLocationData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user?.id) return;

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('district_id, community_id, unit_number')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        let districtName = '';
        let communityName = '';

        if (profile?.district_id) {
          const { data: district } = await supabase
            .from('districts')
            .select('name')
            .eq('id', profile.district_id)
            .single();
          
          districtName = district?.name || '';
        }

        if (profile?.community_id) {
          const { data: community } = await supabase
            .from('communities')
            .select('name')
            .eq('id', profile.community_id)
            .single();
          
          communityName = community?.name || '';
        }

        setLocationData({
          unit_number: profile?.unit_number || '',
          district_name: districtName,
          community_name: communityName
        });
      } catch (error) {
        console.error('Error fetching user location:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-subtle rounded-xl p-6 mb-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </div>
    );
  }

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'User';
  const locationText = locationData.unit_number 
    ? `${locationData.district_name} - Unit ${locationData.unit_number}`
    : locationData.district_name || locationData.community_name || '';

  return (
    <div className="w-full bg-gradient-subtle rounded-xl p-6 mb-6 border border-border/50 shadow-community">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{displayName}</span>
            </h1>
          </div>
          {locationText && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <p className="text-sm">{locationText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};