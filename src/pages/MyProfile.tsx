import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Shield, Settings, Camera, Edit, Save } from 'lucide-react';

export default function MyProfile() {
  const { user, profile, language, roleInfo } = useEnhancedAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  if (!user || !profile) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = profile?.full_name || user.email || 'User';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'My Profile' : 'Profil Saya'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage your personal information and preferences'
              : 'Urus maklumat peribadi dan keutamaan anda'
            }
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
          className={isEditing ? "bg-gradient-primary" : ""}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Save Changes' : 'Simpan Perubahan'}
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Edit Profile' : 'Edit Profil'}
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold">{displayName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge variant="secondary">District {profile?.district_id || 'N/A'}</Badge>
                {roleInfo && (
                  <Badge variant="outline">{roleInfo.display_name}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          {roleInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{language === 'en' ? 'Role Information' : 'Maklumat Peranan'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Current Role' : 'Peranan Semasa'}
                  </Label>
                  <p className="text-sm text-muted-foreground">{roleInfo.display_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Permission Level' : 'Tahap Kebenaran'}
                  </Label>
                  <p className="text-sm text-muted-foreground">Level {roleInfo.level}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/role-management')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Request Role Change' : 'Mohon Tukar Peranan'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{language === 'en' ? 'Personal Information' : 'Maklumat Peribadi'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Your basic personal details and contact information'
                  : 'Butiran peribadi asas dan maklumat hubungan anda'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {language === 'en' ? 'Full Name' : 'Nama Penuh'}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{displayName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'en' ? 'Email Address' : 'Alamat Emel'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {language === 'en' ? 'Phone Number' : 'Nombor Telefon'}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {profile?.phone || 'Not set'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">
                    {language === 'en' ? 'Unit Number' : 'Nombor Unit'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile?.unit_number || 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>{language === 'en' ? 'Preferences' : 'Keutamaan'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {language === 'en' ? 'Language Preference' : 'Keutamaan Bahasa'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded">
                    {language === 'en' ? 'English' : 'Bahasa Malaysia'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === 'en' ? 'Account Status' : 'Status Akaun'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded">
                    Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            {language === 'en' ? 'Cancel' : 'Batal'}
          </Button>
          <Button className="bg-gradient-primary">
            {language === 'en' ? 'Save Changes' : 'Simpan Perubahan'}
          </Button>
        </div>
      )}
    </div>
  );
}