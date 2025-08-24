import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
import { User, Phone, Mail, MapPin, Car, Shield, Settings, Camera, Edit, Save, Bell, Calendar, Users, FileText, CheckCircle } from 'lucide-react';

export default function MyProfile() {
  const { user, language, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
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
    
    // Butiran Tambahan
    occupation_id: '',
    type_sector: '',
    ict_knowledge: '',
    education_level: '',
    income_range: '',
    distance: '',
    
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

  const handleSave = () => {
    // Validation for required fields
    const requiredFields = ['fullname', 'identity_no', 'gender', 'dob', 'mobile_no', 'email', 'nationality_id'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Sila lengkapkan medan wajib: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Format emel tidak sah');
      return;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(formData.mobile_no)) {
      alert('Format nombor telefon tidak sah');
      return;
    }

    // Identity number validation
    if (formData.identity_no.length < 12) {
      alert('Nombor kad pengenalan tidak sah');
      return;
    }

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
          <h1 className="text-3xl font-bold text-foreground">Maklumat Peribadi</h1>
          <p className="text-muted-foreground">
            Urus maklumat peribadi dan keutamaan anda
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan
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
                  <Label htmlFor="identity_no">No. Kad Pengenalan *</Label>
                  {isEditing ? (
                    <Input
                      id="identity_no"
                      value={formData.identity_no}
                      onChange={(e) => setFormData({...formData, identity_no: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.identity_no}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identity_no_type">Jenis Kad Pengenalan</Label>
                  {isEditing ? (
                    <Select value={formData.identity_no_type} onValueChange={(value) => setFormData({...formData, identity_no_type: value})}>
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
                    <p className="text-sm p-2 bg-muted rounded">{formData.identity_no_type === 'ic' ? 'MyKad' : formData.identity_no_type === 'passport' ? 'Pasport' : 'Lain-lain'}</p>
                  )}
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
                  <Label htmlFor="dob">Tarikh Lahir *</Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formData.dob}
                    </p>
                  )}
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
                  <Label htmlFor="race_id">Bangsa</Label>
                  {isEditing ? (
                    <Select value={formData.race_id} onValueChange={(value) => setFormData({...formData, race_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bangsa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="melayu">Melayu</SelectItem>
                        <SelectItem value="cina">Cina</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="other">Lain-lain</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.race_id}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ethnic_id">Etnik</Label>
                  {isEditing ? (
                    <Select value={formData.ethnic_id} onValueChange={(value) => setFormData({...formData, ethnic_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih etnik" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="melayu">Melayu</SelectItem>
                        <SelectItem value="cina">Cina</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="other">Lain-lain</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.ethnic_id}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality_id">Warganegara *</Label>
                  {isEditing ? (
                    <Select value={formData.nationality_id} onValueChange={(value) => setFormData({...formData, nationality_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih warganegara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="malaysia">Malaysia</SelectItem>
                        <SelectItem value="other">Bukan Warganegara</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.nationality_id}</p>
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
                  <Label htmlFor="ict_knowledge">Pengetahuan ICT (1-5)</Label>
                  {isEditing ? (
                    <Select value={formData.ict_knowledge} onValueChange={(value) => setFormData({...formData, ict_knowledge: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Asas</SelectItem>
                        <SelectItem value="2">2 - Rendah</SelectItem>
                        <SelectItem value="3">3 - Sederhana</SelectItem>
                        <SelectItem value="4">4 - Baik</SelectItem>
                        <SelectItem value="5">5 - Cemerlang</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.ict_knowledge}</p>
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
                <div className="space-y-2">
                  <Label htmlFor="distance">Jarak Ke Lokasi (km)</Label>
                  {isEditing ? (
                    <Input
                      id="distance"
                      type="number"
                      value={formData.distance}
                      onChange={(e) => setFormData({...formData, distance: e.target.value})}
                      placeholder="0"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.distance} km</p>
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
                  <Label htmlFor="register_method">Kaedah Pendaftaran</Label>
                  {isEditing ? (
                    <Select value={formData.register_method} onValueChange={(value) => setFormData({...formData, register_method: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kaedah pendaftaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Dalam Talian</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="kiosk">Kiosk</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.register_method}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="registration_status"
                    checked={formData.registration_status}
                    onCheckedChange={(checked) => setFormData({...formData, registration_status: checked})}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="registration_status">Status Pendaftaran</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervision">Penyeliaan</Label>
                  {isEditing ? (
                    <Input
                      id="supervision"
                      value={formData.supervision}
                      onChange={(e) => setFormData({...formData, supervision: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.supervision}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membership_id">Membership ID</Label>
                  {isEditing ? (
                    <Input
                      id="membership_id"
                      value={formData.membership_id}
                      onChange={(e) => setFormData({...formData, membership_id: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{formData.membership_id}</p>
                  )}
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