import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { HouseholdAccountManager } from '@/components/household/HouseholdAccountManager';
import { User, Phone, Mail, MapPin, Car, Shield, Settings, Camera, Edit, Save, Bell, Calendar, Users, FileText, CheckCircle, Heart } from 'lucide-react';

export default function MyProfile() {
  const { user, language, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Maklumat Peribadi
    fullname: user?.display_name || '',
    identity_no: '',
    identity_no_type: 'ic',
    gender: '',
    dob: '',
    age: '',
    mobile_no: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    socio_id: '',
    race_id: '',
    ethnic_id: '',
    nationality_id: '',
    oku_status: false,
    marital_status: '',
    
    // Maklumat Pasangan (jika ada)
    spouse_full_name: '',
    spouse_identity_no: '',
    spouse_identity_no_type: 'ic',
    spouse_gender: '',
    spouse_dob: '',
    spouse_mobile_no: '',
    spouse_occupation: '',
    spouse_workplace: '',
    
    // Butiran Tambahan
    occupation_id: '',
    type_sector: '',
    education_level: '',
    income_range: '',
    
    // Status & Keahlian
    community_status: false,
    status_membership: '',
    status_entrepreneur: false,
    register_method: '',
    registration_status: false,
    supervision: '',
    membership_id: '',
    user_id: user?.id || '',
    
    // Pengisytiharan
    pdpa_declare: false,
    agree_declare: false
  });

  // Load profile data from database
  const loadProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast.error('Ralat memuat profil');
        return;
      }

      if (profile) {
        setFormData({
          fullname: profile.full_name || user.display_name || '',
          identity_no: profile.identity_no || '',
          identity_no_type: profile.identity_no_type || 'ic',
          gender: profile.gender || '',
          dob: profile.dob || '',
          age: profile.age?.toString() || '',
          mobile_no: profile.mobile_no || user.phone || '',
          email: profile.email || user.email || '',
          address: profile.address || '',
          socio_id: profile.socio_id || '',
          race_id: profile.race_id || '',
          ethnic_id: profile.ethnic_id || '',
          nationality_id: profile.nationality_id || '',
          oku_status: profile.oku_status || false,
          marital_status: profile.marital_status || '',
          spouse_full_name: profile.spouse_full_name || '',
          spouse_identity_no: profile.spouse_identity_no || '',
          spouse_identity_no_type: profile.spouse_identity_no_type || 'ic',
          spouse_gender: profile.spouse_gender || '',
          spouse_dob: profile.spouse_dob || '',
          spouse_mobile_no: profile.spouse_mobile_no || '',
          spouse_occupation: profile.spouse_occupation || '',
          spouse_workplace: profile.spouse_workplace || '',
          occupation_id: profile.occupation_id || '',
          type_sector: profile.type_sector || '',
          education_level: profile.education_level || '',
          income_range: profile.income_range || '',
          community_status: profile.community_status || false,
          status_membership: profile.status_membership || '',
          status_entrepreneur: profile.status_entrepreneur || false,
          register_method: profile.register_method || '',
          registration_status: profile.registration_status || false,
          supervision: profile.supervision || '',
          membership_id: profile.membership_id || '',
          user_id: user.id,
          pdpa_declare: profile.pdpa_declare || false,
          agree_declare: profile.agree_declare || false
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Ralat memuat profil');
    } finally {
      setLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  // Auto-calculate age from dob
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dob]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maklumat Peribadi</h1>
            <p className="text-muted-foreground">Memuat maklumat peribadi...</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-muted rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded mx-auto animate-pulse"></div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    // Validation for required fields
    const requiredFields = ['fullname', 'identity_no', 'gender', 'dob', 'mobile_no', 'email', 'nationality_id'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Sila lengkapkan medan wajib: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format emel tidak sah');
      return;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(formData.mobile_no)) {
      toast.error('Format nombor telefon tidak sah');
      return;
    }

    // Identity number validation
    if (formData.identity_no.length < 12) {
      toast.error('Nombor kad pengenalan tidak sah');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for database
      const profileData = {
        id: user.id, // Required for upsert
        user_id: user.id, // Required user_id field for foreign key
        full_name: formData.fullname,
        email: formData.email,
        identity_no: formData.identity_no,
        identity_no_type: formData.identity_no_type,
        gender: formData.gender,
        dob: formData.dob,
        age: parseInt(formData.age) || null,
        mobile_no: formData.mobile_no,
        address: formData.address,
        socio_id: formData.socio_id,
        race_id: formData.race_id,
        ethnic_id: formData.ethnic_id,
        nationality_id: formData.nationality_id,
        oku_status: formData.oku_status,
        marital_status: formData.marital_status,
        spouse_full_name: formData.spouse_full_name || null,
        spouse_identity_no: formData.spouse_identity_no || null,
        spouse_identity_no_type: formData.spouse_identity_no_type,
        spouse_gender: formData.spouse_gender || null,
        spouse_dob: formData.spouse_dob || null,
        spouse_mobile_no: formData.spouse_mobile_no || null,
        spouse_occupation: formData.spouse_occupation || null,
        spouse_workplace: formData.spouse_workplace || null,
        occupation_id: formData.occupation_id,
        type_sector: formData.type_sector,
        education_level: formData.education_level,
        income_range: formData.income_range,
        community_status: formData.community_status,
        status_membership: formData.status_membership,
        status_entrepreneur: formData.status_entrepreneur,
        register_method: formData.register_method,
        registration_status: formData.registration_status,
        supervision: formData.supervision,
        membership_id: formData.membership_id,
        pdpa_declare: formData.pdpa_declare,
        agree_declare: formData.agree_declare,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Ralat menyimpan profil');
        return;
      }

      toast.success('Profil berjaya dikemaskini');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ralat menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maklumat Peribadi</h1>
          <p className="text-muted-foreground">
            Urus maklumat peribadi dan keutamaan anda
          </p>
        </div>
        <Button 
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
          disabled={loading}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit
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
               <h3 className="text-xl font-semibold">{formData.fullname || user.display_name}</h3>
              <p className="text-muted-foreground">{formData.email || user.email}</p>
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
                onClick={() => navigate('/role-management')}
              >
                <Shield className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Request Role Change' : 'Mohon Tukar Peranan'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Household Account Management */}
          <HouseholdAccountManager />
          
          {/* Maklumat Peribadi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Maklumat Peribadi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nama Penuh *</Label>
                  {isEditing ? (
                    <Input
                      id="fullname"
                      value={formData.fullname}
                      onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.fullname}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identity_no">No. Kad Pengenalan * (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.identity_no || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identity_no_type">Jenis Kad Pengenalan (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.identity_no_type === 'ic' ? 'MyKad' : formData.identity_no_type === 'passport' ? 'Pasport' : 'Lain-lain'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Jantina *</Label>
                  {isEditing ? (
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lelaki">Lelaki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Tarikh Lahir * (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formData.dob || 'Belum diisi'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Umur</Label>
                  <p className="text-sm p-2 bg-muted rounded">{formData.age} tahun</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile_no">Nombor Telefon *</Label>
                  {isEditing ? (
                    <Input
                      id="mobile_no"
                      type="tel"
                      value={formData.mobile_no}
                      onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {formData.mobile_no}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Emel *</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {formData.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{formData.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daerah / Komuniti</Label>
                  <p className="text-sm p-2 bg-muted rounded flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.district}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="race_id">Bangsa (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.race_id || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ethnic_id">Etnik (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.ethnic_id || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality_id">Warganegara * (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.nationality_id || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status">Status Perkahwinan</Label>
                  {isEditing ? (
                    <Select value={formData.marital_status} onValueChange={(value) => setFormData({...formData, marital_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status perkahwinan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bujang">Bujang</SelectItem>
                        <SelectItem value="berkahwin">Berkahwin</SelectItem>
                        <SelectItem value="bercerai">Bercerai</SelectItem>
                        <SelectItem value="balu">Balu</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.marital_status || 'Belum diisi'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="oku_status"
                  checked={formData.oku_status}
                  onCheckedChange={(checked) => setFormData({...formData, oku_status: checked})}
                  disabled={!isEditing}
                />
                <Label htmlFor="oku_status">Status OKU</Label>
              </div>
            </CardContent>
          </Card>

          {/* Maklumat Pasangan */}
          {formData.marital_status === 'berkahwin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Maklumat Pasangan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spouse_full_name">Nama Penuh Pasangan</Label>
                    {isEditing ? (
                      <Input
                        id="spouse_full_name"
                        value={formData.spouse_full_name}
                        onChange={(e) => setFormData({...formData, spouse_full_name: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{formData.spouse_full_name || 'Belum diisi'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_identity_no">No. Kad Pengenalan Pasangan</Label>
                    {isEditing ? (
                      <Input
                        id="spouse_identity_no"
                        value={formData.spouse_identity_no}
                        onChange={(e) => setFormData({...formData, spouse_identity_no: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{formData.spouse_identity_no || 'Belum diisi'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_identity_no_type">Jenis Kad Pengenalan Pasangan</Label>
                    {isEditing ? (
                      <Select value={formData.spouse_identity_no_type} onValueChange={(value) => setFormData({...formData, spouse_identity_no_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ic">MyKad</SelectItem>
                          <SelectItem value="passport">Pasport</SelectItem>
                          <SelectItem value="other">Lain-lain</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{formData.spouse_identity_no_type === 'ic' ? 'MyKad' : formData.spouse_identity_no_type === 'passport' ? 'Pasport' : 'Lain-lain'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_gender">Jantina Pasangan</Label>
                    {isEditing ? (
                      <Select value={formData.spouse_gender} onValueChange={(value) => setFormData({...formData, spouse_gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jantina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lelaki">Lelaki</SelectItem>
                          <SelectItem value="perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{formData.spouse_gender || 'Belum diisi'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_dob">Tarikh Lahir Pasangan</Label>
                    {isEditing ? (
                      <Input
                        id="spouse_dob"
                        type="date"
                        value={formData.spouse_dob}
                        onChange={(e) => setFormData({...formData, spouse_dob: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formData.spouse_dob || 'Belum diisi'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_mobile_no">Nombor Telefon Pasangan</Label>
                    {isEditing ? (
                      <Input
                        id="spouse_mobile_no"
                        type="tel"
                        value={formData.spouse_mobile_no}
                        onChange={(e) => setFormData({...formData, spouse_mobile_no: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {formData.spouse_mobile_no || 'Belum diisi'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_occupation">Pekerjaan Pasangan</Label>
                    {isEditing ? (
                      <Input
                        id="spouse_occupation"
                        value={formData.spouse_occupation}
                        onChange={(e) => setFormData({...formData, spouse_occupation: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{formData.spouse_occupation || 'Belum diisi'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse_workplace">Tempat Kerja Pasangan</Label>
                    {isEditing ? (
                      <Input
                        id="spouse_workplace"
                        value={formData.spouse_workplace}
                        onChange={(e) => setFormData({...formData, spouse_workplace: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{formData.spouse_workplace || 'Belum diisi'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Butiran Tambahan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Butiran Tambahan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation_id">Pekerjaan</Label>
                  {isEditing ? (
                    <Select value={formData.occupation_id} onValueChange={(value) => setFormData({...formData, occupation_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pekerjaan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kerajaan">Sektor Kerajaan</SelectItem>
                        <SelectItem value="swasta">Sektor Swasta</SelectItem>
                        <SelectItem value="sendiri">Bekerja Sendiri</SelectItem>
                        <SelectItem value="pelajar">Pelajar</SelectItem>
                        <SelectItem value="tidak_bekerja">Tidak Bekerja</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.occupation_id}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type_sector">Sektor Pekerjaan</Label>
                  {isEditing ? (
                    <Select value={formData.type_sector} onValueChange={(value) => setFormData({...formData, type_sector: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sektor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teknologi">Teknologi</SelectItem>
                        <SelectItem value="kewangan">Kewangan</SelectItem>
                        <SelectItem value="pendidikan">Pendidikan</SelectItem>
                        <SelectItem value="kesihatan">Kesihatan</SelectItem>
                        <SelectItem value="other">Lain-lain</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.type_sector}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_level">Tahap Pendidikan</Label>
                  {isEditing ? (
                    <Select value={formData.education_level} onValueChange={(value) => setFormData({...formData, education_level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahap pendidikan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spm">SPM</SelectItem>
                        <SelectItem value="stpm">STPM/Diploma</SelectItem>
                        <SelectItem value="sarjana_muda">Ijazah Sarjana Muda</SelectItem>
                        <SelectItem value="sarjana">Ijazah Sarjana</SelectItem>
                        <SelectItem value="phd">Ijazah Doktor Falsafah</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.education_level}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income_range">Julat Pendapatan</Label>
                  {isEditing ? (
                    <Select value={formData.income_range} onValueChange={(value) => setFormData({...formData, income_range: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih julat pendapatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below_2000">Bawah RM2,000</SelectItem>
                        <SelectItem value="2000_4000">RM2,000 - RM4,000</SelectItem>
                        <SelectItem value="4000_6000">RM4,000 - RM6,000</SelectItem>
                        <SelectItem value="6000_8000">RM6,000 - RM8,000</SelectItem>
                        <SelectItem value="above_8000">Melebihi RM8,000</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.income_range}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Keahlian */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Status & Keahlian</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="community_status"
                    checked={formData.community_status}
                    onCheckedChange={(checked) => setFormData({...formData, community_status: checked})}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="community_status">Status Komuniti</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status_membership">Status Keahlian</Label>
                  {isEditing ? (
                    <Select value={formData.status_membership} onValueChange={(value) => setFormData({...formData, status_membership: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status keahlian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                        <SelectItem value="pending">Menunggu</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.status_membership}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status_entrepreneur"
                    checked={formData.status_entrepreneur}
                    onCheckedChange={(checked) => setFormData({...formData, status_entrepreneur: checked})}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="status_entrepreneur">Status Usahawan</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register_method">Kaedah Pendaftaran (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.register_method || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_status">Status Pendaftaran (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">
                    {formData.registration_status ? 'Aktif' : 'Tidak Aktif'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervision">Penyeliaan (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.supervision || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membership_id">Membership ID (Tidak boleh diubah)</Label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{formData.membership_id || 'Belum diisi'}</p>
                </div>
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <p className="text-sm p-2 bg-muted rounded">{formData.user_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pengisytiharan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Pengisytiharan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdpa_declare"
                  checked={formData.pdpa_declare}
                  onCheckedChange={(checked) => setFormData({...formData, pdpa_declare: !!checked})}
                  disabled={!isEditing}
                />
                <Label htmlFor="pdpa_declare">Pengisytiharan PDPA</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree_declare"
                  checked={formData.agree_declare}
                  onCheckedChange={(checked) => setFormData({...formData, agree_declare: !!checked})}
                  disabled={!isEditing}
                />
                <Label htmlFor="agree_declare">Persetujuan Syarat & Terma</Label>
              </div>
            </CardContent>
          </Card>

          {/* Audit Maklumat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Audit Maklumat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarikh Sertai</Label>
                  <p className="text-sm p-2 bg-muted rounded">N/A</p>
                </div>
                <div className="space-y-2">
                  <Label>Dicipta Oleh</Label>
                  <p className="text-sm p-2 bg-muted rounded">System</p>
                </div>
                <div className="space-y-2">
                  <Label>Tarikh Dicipta</Label>
                  <p className="text-sm p-2 bg-muted rounded">N/A</p>
                </div>
                <div className="space-y-2">
                  <Label>Dikemaskini Oleh</Label>
                  <p className="text-sm p-2 bg-muted rounded">{user.display_name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Tarikh Dikemaskini</Label>
                  <p className="text-sm p-2 bg-muted rounded">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </div>
      )}
    </div>
  );
}