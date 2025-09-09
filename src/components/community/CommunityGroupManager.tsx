import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Crown, MapPin, Calendar, DollarSign, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/use-user-roles';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  group_type: string;
  category: string;
  leader_id: string;
  max_members: number;
  membership_fee: number;
  requires_approval: boolean;
  is_active: boolean;
  meeting_schedule?: string;
  meeting_frequency?: string;
  contact_info?: string;
  member_count?: number;
  user_membership?: {
    status: string;
    role: string;
  };
}

export default function CommunityGroupManager() {
  const { user, language } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    group_type: 'interest',
    category: 'interest',
    max_members: 50,
    membership_fee: 0,
    requires_approval: false,
    meeting_schedule: '',
    meeting_frequency: '',
    contact_info: ''
  });

  const canManageGroups = hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin');

  const text = {
    en: {
      title: 'Community Groups',
      description: 'Join and manage community interest groups',
      createGroup: 'Create Group',
      joinGroup: 'Join Group',
      leaveGroup: 'Leave Group',
      manageGroup: 'Manage Group',
      viewMembers: 'View Members',
      pendingApproval: 'Pending Approval',
      approved: 'Approved',
      member: 'Member',
      leader: 'Leader',
      groupName: 'Group Name',
      groupDescription: 'Description',
      groupType: 'Group Type',
      category: 'Category',
      maxMembers: 'Max Members',
      membershipFee: 'Membership Fee (RM)',
      requiresApproval: 'Requires Approval',
      meetingSchedule: 'Meeting Schedule',
      meetingFrequency: 'Meeting Frequency',
      contactInfo: 'Contact Information',
      createNewGroup: 'Create New Group',
      save: 'Create Group',
      cancel: 'Cancel',
      noGroups: 'No community groups found',
      groupCreated: 'Group created successfully',
      groupCreateError: 'Failed to create group',
      joinSuccess: 'Successfully joined group',
      joinError: 'Failed to join group',
      leaveSuccess: 'Successfully left group',
      leaveError: 'Failed to leave group',
      members: 'members',
      free: 'Free',
      interest: 'Interest Group',
      sports: 'Sports Club',
      education: 'Educational',
      social: 'Social Club',
      hobby: 'Hobby Group',
      professional: 'Professional',
      weekly: 'Weekly',
      monthly: 'Monthly',
      biweekly: 'Bi-weekly',
      quarterly: 'Quarterly',
      asNeeded: 'As Needed'
    },
    ms: {
      title: 'Kumpulan Komuniti',
      description: 'Sertai dan urus kumpulan minat komuniti',
      createGroup: 'Cipta Kumpulan',
      joinGroup: 'Sertai Kumpulan',
      leaveGroup: 'Keluar Kumpulan',
      manageGroup: 'Urus Kumpulan',
      viewMembers: 'Lihat Ahli',
      pendingApproval: 'Menunggu Kelulusan',
      approved: 'Diluluskan',
      member: 'Ahli',
      leader: 'Ketua',
      groupName: 'Nama Kumpulan',
      groupDescription: 'Penerangan',
      groupType: 'Jenis Kumpulan',
      category: 'Kategori',
      maxMembers: 'Ahli Maksimum',
      membershipFee: 'Yuran Keahlian (RM)',
      requiresApproval: 'Memerlukan Kelulusan',
      meetingSchedule: 'Jadual Mesyuarat',
      meetingFrequency: 'Kekerapan Mesyuarat',
      contactInfo: 'Maklumat Hubungan',
      createNewGroup: 'Cipta Kumpulan Baru',
      save: 'Cipta Kumpulan',
      cancel: 'Batal',
      noGroups: 'Tiada kumpulan komuniti dijumpai',
      groupCreated: 'Kumpulan berjaya dicipta',
      groupCreateError: 'Gagal mencipta kumpulan',
      joinSuccess: 'Berjaya menyertai kumpulan',
      joinError: 'Gagal menyertai kumpulan',
      leaveSuccess: 'Berjaya meninggalkan kumpulan',
      leaveError: 'Gagal meninggalkan kumpulan',
      members: 'ahli',
      free: 'Percuma',
      interest: 'Kumpulan Minat',
      sports: 'Kelab Sukan',
      education: 'Pendidikan',
      social: 'Kelab Sosial',
      hobby: 'Kumpulan Hobi',
      professional: 'Profesional',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      biweekly: 'Dua Minggu',
      quarterly: 'Suku Tahunan',
      asNeeded: 'Bila Perlu'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Fetch membership info for current user
      const groupsWithMembership = await Promise.all(
        (data || []).map(async (group) => {
          // Get member count
          const { count } = await supabase
            .from('community_group_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('status', 'active');
          
          // Get user's membership status
          let userMembership = null;
          if (user) {
            const { data: membershipData } = await supabase
              .from('community_group_memberships')
              .select('status, role')
              .eq('group_id', group.id)
              .eq('user_id', user.id)
              .eq('status', 'active')
              .single();
            
            userMembership = membershipData;
          }

          return {
            ...group,
            member_count: count || 0,
            user_membership: userMembership
          };
        })
      );

      setGroups(groupsWithMembership);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch community groups',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          ...newGroup,
          leader_id: user?.id,
          district_id: user?.district
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as leader member
      await supabase
        .from('community_group_memberships')
        .insert({
          group_id: data.id,
          user_id: user?.id,
          status: 'active',
          role: 'leader'
        });

      toast({
        title: 'Success',
        description: t.groupCreated
      });

      setCreateModalOpen(false);
      setNewGroup({
        name: '',
        description: '',
        group_type: 'interest',
        category: 'interest',
        max_members: 50,
        membership_fee: 0,
        requires_approval: false,
        meeting_schedule: '',
        meeting_frequency: '',
        contact_info: ''
      });

      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: t.groupCreateError,
        variant: 'destructive'
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('community_group_memberships')
        .insert({
          group_id: groupId,
          user_id: user?.id,
          status: 'active',
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: t.joinSuccess
      });

      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: t.joinError,
        variant: 'destructive'
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('community_group_memberships')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: t.leaveSuccess
      });

      fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: t.leaveError,
        variant: 'destructive'
      });
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'sports': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'hobby': return 'bg-orange-100 text-orange-800';
      case 'professional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const [groupTypes, setGroupTypes] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<string[]>([]);

  const fetchConfigurationData = async () => {
    try {
      // Fetch group types
      const { data: groupTypesData, error: groupTypesError } = await supabase
        .from('group_types')
        .select('code, name')
        .eq('is_active', true)
        .order('sort_order');

      if (groupTypesError) throw groupTypesError;
      setGroupTypes(groupTypesData?.map(g => g.code) || []);

      // Fetch frequency types
      const { data: frequenciesData, error: frequenciesError } = await supabase
        .from('frequency_types')
        .select('code, name')
        .eq('is_active', true)
        .order('sort_order');

      if (frequenciesError) throw frequenciesError;
      setFrequencies(frequenciesData?.map(f => f.code) || []);

    } catch (error) {
      console.error('Error fetching configuration data:', error);
    }
  };

  useEffect(() => {
    fetchConfigurationData();
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t.createGroup}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createNewGroup}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.groupName}</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.groupDescription}</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your group's purpose and activities"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.groupType}</Label>
                  <Select
                    value={newGroup.group_type}
                    onValueChange={(value) => setNewGroup(prev => ({ ...prev, group_type: value, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groupTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {t[type as keyof typeof t] as string}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.meetingFrequency}</Label>
                  <Select
                    value={newGroup.meeting_frequency}
                    onValueChange={(value) => setNewGroup(prev => ({ ...prev, meeting_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map(freq => (
                        <SelectItem key={freq} value={freq}>
                          {t[freq as keyof typeof t] as string}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.maxMembers}</Label>
                  <Input
                    type="number"
                    value={newGroup.max_members}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, max_members: parseInt(e.target.value) || 50 }))}
                    min="1"
                    max="200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.membershipFee}</Label>
                  <Input
                    type="number"
                    value={newGroup.membership_fee}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, membership_fee: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.meetingSchedule}</Label>
                <Input
                  value={newGroup.meeting_schedule}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, meeting_schedule: e.target.value }))}
                  placeholder="e.g., Every Saturday 2:00 PM at Community Hall"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.contactInfo}</Label>
                <Input
                  value={newGroup.contact_info}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, contact_info: e.target.value }))}
                  placeholder="Contact email or phone number"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button onClick={createGroup} className="flex-1">
                  {t.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">{t.noGroups}</h3>
            <p className="text-muted-foreground">Create the first community group!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {group.description}
                    </CardDescription>
                  </div>
                  {group.user_membership?.role === 'leader' && (
                    <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className={getGroupTypeColor(group.group_type)}>
                    {t[group.group_type as keyof typeof t] as string}
                  </Badge>
                  {group.user_membership && (
                    <Badge variant="secondary">
                      {t[group.user_membership.role as keyof typeof t] as string}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count || 0}/{group.max_members} {t.members}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{group.membership_fee > 0 ? `RM${group.membership_fee}` : t.free}</span>
                    </div>
                  </div>
                  
                  {group.meeting_schedule && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{group.meeting_schedule}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {group.user_membership ? (
                      <>
                        {group.user_membership.role === 'leader' ? (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Crown className="w-4 h-4 mr-2" />
                            {t.manageGroup}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => leaveGroup(group.id)}
                            className="flex-1"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            {t.leaveGroup}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => joinGroup(group.id)}
                        disabled={(group.member_count || 0) >= group.max_members}
                        className="flex-1"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t.joinGroup}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}