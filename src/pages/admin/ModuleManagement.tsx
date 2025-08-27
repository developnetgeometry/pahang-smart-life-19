import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Shield, Users, Building, MessageSquare, Calendar, ShoppingCart, Camera, UserCheck, Phone } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  district_id: string;
}

interface ModuleFeature {
  id?: string;
  module_name: string;
  display_name: string;
  category: string;
  is_enabled: boolean;
  notes?: string;
  is_core?: boolean;
}

const AVAILABLE_MODULES = [
  { module_name: 'facilities', display_name: 'Facilities Management', category: 'community', icon: Building, description: 'Manage community facilities and bookings' },
  { module_name: 'bookings', display_name: 'Facility Bookings', category: 'community', icon: Calendar, description: 'Book and manage facility reservations' },
  { module_name: 'marketplace', display_name: 'Marketplace', category: 'community', icon: ShoppingCart, description: 'Community marketplace for buying/selling' },
  { module_name: 'discussions', display_name: 'Community Discussions', category: 'communication', icon: MessageSquare, description: 'Community forum and discussions' },
  { module_name: 'service_requests', display_name: 'Service Requests', category: 'services', icon: Settings, description: 'Request community services' },
  { module_name: 'events', display_name: 'Events', category: 'community', icon: Calendar, description: 'Community events and activities' },
  { module_name: 'cctv', display_name: 'CCTV Monitoring', category: 'security', icon: Camera, description: 'Security camera monitoring' },
  { module_name: 'visitor_management', display_name: 'Visitor Management', category: 'security', icon: UserCheck, description: 'Manage visitor access and tracking' },
];

const CORE_MODULES = ['announcements', 'complaints', 'directory'];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'community': return Building;
    case 'communication': return MessageSquare;
    case 'services': return Settings;
    case 'security': return Shield;
    default: return Settings;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'community': return 'bg-blue-500/20 text-blue-700 border-blue-200';
    case 'communication': return 'bg-green-500/20 text-green-700 border-green-200';
    case 'services': return 'bg-purple-500/20 text-purple-700 border-purple-200';
    case 'security': return 'bg-red-500/20 text-red-700 border-red-200';
    default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
  }
};

export default function ModuleManagement() {
  const { hasRole } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [moduleFeatures, setModuleFeatures] = useState<ModuleFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canManageOwnCommunity = hasRole('community_admin');

  useEffect(() => {
    const fetchCommunities = async () => {
      console.log('ModuleManagement: Starting to fetch communities, canManageOwnCommunity:', canManageOwnCommunity);
      try {
        let query = supabase.from('communities').select(`
          id, 
          name, 
          district_id,
          districts!inner(name)
        `);
        
        // Community admins can only see their own community
        if (canManageOwnCommunity) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('community_id')
            .eq('id', (await supabase.auth.getUser()).data.user?.id)
            .single();
          
          console.log('ModuleManagement: User profile:', userProfile);
          
          if (userProfile?.community_id) {
            query = query.eq('id', userProfile.community_id);
          }
        }

        const { data, error } = await query.order('name');
        
        console.log('ModuleManagement: Communities query result:', { data, error });
        
        if (error) throw error;
        
        // Transform data to include district name in community name
        const transformedCommunities = (data || []).map(community => ({
          id: community.id,
          name: `${community.name} (${community.districts?.name || 'Unknown District'})`,
          district_id: community.district_id
        }));
        
        console.log('ModuleManagement: Transformed communities:', transformedCommunities);
        setCommunities(transformedCommunities);
        
        // Auto-select first community if only one available
        if (transformedCommunities && transformedCommunities.length === 1) {
          console.log('ModuleManagement: Auto-selecting community:', transformedCommunities[0].id);
          setSelectedCommunity(transformedCommunities[0].id);
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
        toast.error('Failed to load communities');
      } finally {
        console.log('ModuleManagement: Setting loading to false');
        setLoading(false);
      }
    };

    if (canManageOwnCommunity) {
      fetchCommunities();
    } else {
      console.log('ModuleManagement: User cannot manage community, setting loading to false');
      setLoading(false);
    }
  }, [canManageOwnCommunity]);

  useEffect(() => {
    const fetchModuleFeatures = async () => {
      if (!selectedCommunity) {
        console.log('ModuleManagement: No selected community, skipping module features fetch');
        return;
      }

      console.log('ModuleManagement: Fetching module features for community:', selectedCommunity);
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('community_features')
          .select('*')
          .eq('community_id', selectedCommunity);

        console.log('ModuleManagement: Community features result:', { data, error });
        if (error) throw error;

        // Create module features array with all available modules
        const features: ModuleFeature[] = AVAILABLE_MODULES.map(module => {
          const existingFeature = data?.find(f => f.module_name === module.module_name);
          return {
            id: existingFeature?.id,
            module_name: module.module_name,
            display_name: module.display_name,
            category: module.category,
            is_enabled: existingFeature?.is_enabled || false,
            notes: existingFeature?.notes || '',
            is_core: CORE_MODULES.includes(module.module_name)
          };
        });

        console.log('ModuleManagement: Final module features:', features);
        setModuleFeatures(features);
      } catch (error) {
        console.error('Error fetching module features:', error);
        toast.error('Failed to load module features');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleFeatures();
  }, [selectedCommunity]);

  const handleToggleModule = async (moduleFeature: ModuleFeature, enabled: boolean) => {
    try {
      setSaving(true);
      
      if (moduleFeature.id) {
        // Update existing record
        const { error } = await supabase
          .from('community_features')
          .update({
            is_enabled: enabled,
            enabled_by: (await supabase.auth.getUser()).data.user?.id,
            enabled_at: new Date().toISOString()
          })
          .eq('id', moduleFeature.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('community_features')
          .insert({
            community_id: selectedCommunity,
            module_name: moduleFeature.module_name,
            is_enabled: enabled,
            enabled_by: (await supabase.auth.getUser()).data.user?.id,
            enabled_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update local state
      setModuleFeatures(prev => prev.map(f => 
        f.module_name === moduleFeature.module_name 
          ? { ...f, is_enabled: enabled }
          : f
      ));

      toast.success(`${moduleFeature.display_name} ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating module feature:', error);
      toast.error('Failed to update module feature');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotes = async (moduleFeature: ModuleFeature, notes: string) => {
    try {
      if (moduleFeature.id) {
        const { error } = await supabase
          .from('community_features')
          .update({ notes })
          .eq('id', moduleFeature.id);

        if (error) throw error;
      }

      setModuleFeatures(prev => prev.map(f => 
        f.module_name === moduleFeature.module_name 
          ? { ...f, notes }
          : f
      ));

      toast.success('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  if (!canManageOwnCommunity) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
              <p className="text-sm text-muted-foreground">
                You don't have permission to manage module features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedModules = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODULES>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Module Management</h1>
        <p className="text-muted-foreground">
          Enable or disable community modules for your community
        </p>
      </div>

      {communities.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Community</CardTitle>
            <CardDescription>
              Choose the community to manage module features for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map(community => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedCommunity && (
        <div className="space-y-6">
          {Object.entries(groupedModules).map(([category, modules]) => {
            const CategoryIcon = getCategoryIcon(category);
            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="capitalize">{category} Modules</CardTitle>
                      <CardDescription>
                        Manage {category} related features for this community
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modules.map(module => {
                    const moduleFeature = moduleFeatures.find(f => f.module_name === module.module_name);
                    const isCore = CORE_MODULES.includes(module.module_name);
                    const ModuleIcon = module.icon;

                    return (
                      <div key={module.module_name} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ModuleIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{module.display_name}</h4>
                                {isCore && (
                                  <Badge variant="secondary" className="text-xs">
                                    Core Module
                                  </Badge>
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getCategoryColor(module.category)}`}
                                >
                                  {module.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={isCore || moduleFeature?.is_enabled || false}
                            onCheckedChange={(enabled) => handleToggleModule(moduleFeature || {
                              module_name: module.module_name,
                              display_name: module.display_name,
                              category: module.category,
                              is_enabled: false
                            }, enabled)}
                            disabled={isCore || saving || loading}
                          />
                        </div>
                        
                        {!isCore && moduleFeature && (
                          <div className="pl-8">
                            <Textarea
                              placeholder="Add notes about this module configuration..."
                              value={moduleFeature.notes || ''}
                              onChange={(e) => setModuleFeatures(prev => prev.map(f => 
                                f.module_name === module.module_name 
                                  ? { ...f, notes: e.target.value }
                                  : f
                              ))}
                              onBlur={(e) => handleUpdateNotes(moduleFeature, e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}