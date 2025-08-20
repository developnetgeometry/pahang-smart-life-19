import { useState } from 'react';
import { useEnhancedAuth, EnhancedUserRole } from '@/hooks/useEnhancedAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Users, Wrench, Lock, Hammer, Store, MessageSquare, Settings, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleIcons: Record<EnhancedUserRole, React.ComponentType<any>> = {
  state_admin: Crown,
  district_coordinator: Shield,
  community_admin: Users,
  facility_manager: Settings,
  security_officer: Lock,
  maintenance_staff: Hammer,
  service_provider: Store,
  community_leader: MessageSquare,
  state_service_manager: Wrench,
  resident: User,
};

const roleColors: Record<EnhancedUserRole, string> = {
  state_admin: 'bg-purple-500',
  district_coordinator: 'bg-blue-500',
  community_admin: 'bg-indigo-500',
  facility_manager: 'bg-green-500',
  security_officer: 'bg-red-500',
  maintenance_staff: 'bg-orange-500',
  service_provider: 'bg-yellow-500',
  community_leader: 'bg-pink-500',
  state_service_manager: 'bg-teal-500',
  resident: 'bg-gray-500',
};

export function RoleSwitcher() {
  const { roles, currentRole, roleInfo, switchRole } = useEnhancedAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (roles.length <= 1) return null;

  const handleRoleSwitch = async (newRole: string) => {
    if (newRole === currentRole) return;

    setIsLoading(true);
    try {
      await switchRole(newRole as EnhancedUserRole);
      toast({
        title: "Role Switched",
        description: `You are now operating as ${getRoleDisplayName(newRole as EnhancedUserRole)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: EnhancedUserRole): string => {
    const roleMap: Record<EnhancedUserRole, string> = {
      state_admin: 'State Admin',
      district_coordinator: 'District Coordinator',
      community_admin: 'Community Admin',
      facility_manager: 'Facility Manager',
      security_officer: 'Security Officer',
      maintenance_staff: 'Maintenance Staff',
      service_provider: 'Service Provider',
      community_leader: 'Community Leader',
      state_service_manager: 'State Service Manager',
      resident: 'Resident',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${roleColors[currentRole!]} text-white border-0`}
      >
        <span className="flex items-center gap-1">
          {roleInfo && (() => {
            const IconComponent = roleIcons[currentRole!];
            return <IconComponent className="h-3 w-3" />;
          })()}
          {roleInfo?.display_name}
        </span>
      </Badge>
      
      <Select
        value={currentRole || ''}
        onValueChange={handleRoleSwitch}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Switch role..." />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => {
            const IconComponent = roleIcons[role];
            return (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {getRoleDisplayName(role)}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}