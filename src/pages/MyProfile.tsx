import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MapPin, Car, Shield, Settings, Camera, Edit, Save } from 'lucide-react';

export default function MyProfile() {
  const { user, language, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
    vehicle_registration_numbers: user?.vehicle_registration_numbers || []
  });

  if (!user) return null;

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
                    {getInitials(user.display_name)}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold">{user.display_name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge variant="secondary">{user.district}</Badge>
                <Badge variant="outline">{user.user_role}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
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
                <p className="text-sm text-muted-foreground capitalize">{user.user_role.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === 'en' ? 'Available Roles' : 'Peranan Tersedia'}
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.available_roles.map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === 'en' ? 'Primary Role' : 'Peranan Utama'}
                </Label>
                <p className="text-sm text-muted-foreground capitalize">{user.user_role.replace('_', ' ')}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/role-management'}
              >
                <Shield className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Request Role Change' : 'Mohon Tukar Peranan'}
              </Button>
            </CardContent>
          </Card>
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
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{user.display_name}</p>
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
                      {user.phone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">
                    {language === 'en' ? 'District' : 'Daerah'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.district}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  {language === 'en' ? 'Address' : 'Alamat'}
                </Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{user.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{language === 'en' ? 'Emergency Contact' : 'Hubungan Kecemasan'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Someone we can contact in case of emergency'
                  : 'Seseorang yang boleh kami hubungi dalam kes kecemasan'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name">
                    {language === 'en' ? 'Contact Name' : 'Nama Hubungan'}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="emergency_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{user.emergency_contact_name || 'Not set'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">
                    {language === 'en' ? 'Contact Phone' : 'Telefon Hubungan'}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="emergency_phone"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{user.emergency_contact_phone || 'Not set'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <span>{language === 'en' ? 'Vehicle Information' : 'Maklumat Kenderaan'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Registered vehicles for parking and security purposes'
                  : 'Kenderaan berdaftar untuk tujuan parkir dan keselamatan'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.vehicle_registration_numbers.length > 0 ? (
                  user.vehicle_registration_numbers.map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="flex items-center">
                        <Car className="w-4 h-4 mr-2" />
                        {vehicle}
                      </span>
                      {isEditing && (
                        <Button variant="ghost" size="sm" className="text-red-500">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                    {language === 'en' ? 'No vehicles registered' : 'Tiada kenderaan didaftarkan'}
                  </p>
                )}
                {isEditing && (
                  <Button variant="outline" className="w-full">
                    {language === 'en' ? 'Add Vehicle' : 'Tambah Kenderaan'}
                  </Button>
                )}
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
                    {user.language_preference === 'en' ? 'English' : 'Bahasa Malaysia'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === 'en' ? 'Theme Preference' : 'Keutamaan Tema'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded capitalize">
                    {user.theme_preference}
                  </p>
                </div>
                {user.unit_type && (
                  <div className="space-y-2">
                    <Label>
                      {language === 'en' ? 'Unit Type' : 'Jenis Unit'}
                    </Label>
                    <p className="text-sm p-2 bg-muted rounded">{user.unit_type}</p>
                  </div>
                )}
                {user.ownership_status && (
                  <div className="space-y-2">
                    <Label>
                      {language === 'en' ? 'Ownership Status' : 'Status Pemilikan'}
                    </Label>
                    <p className="text-sm p-2 bg-muted rounded">{user.ownership_status}</p>
                  </div>
                )}
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
          <Button onClick={handleSave} className="bg-gradient-primary">
            {language === 'en' ? 'Save Changes' : 'Simpan Perubahan'}
          </Button>
        </div>
      )}
    </div>
  );
}