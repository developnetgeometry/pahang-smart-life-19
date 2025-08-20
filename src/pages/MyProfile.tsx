import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Edit } from 'lucide-react';

export default function MyProfile() {
  const { user } = useSimpleAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const displayName = user.email || 'User';
  const getInitials = (name: string) => name[0]?.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profil Saya</h1>
          <p className="text-muted-foreground">Urus maklumat peribadi anda</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profil
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{displayName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Maklumat Peribadi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat Emel</label>
                <p className="text-sm p-2 bg-muted rounded flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}