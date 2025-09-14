import { useUserRoles } from '@/hooks/use-user-roles';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function GuestIndicator() {
  const { hasRole } = useUserRoles();
  const { user } = useAuth();

  if (!hasRole('guest') || !user) return null;

  return (
    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
      <Clock className="w-3 h-3 mr-1" />
      Tenant Access
    </Badge>
  );
}
