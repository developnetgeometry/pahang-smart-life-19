import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, Database, Shield, Mail, Bell, Palette, 
  Globe, Clock, Users, Key, AlertTriangle, Save
} from 'lucide-react';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  userRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  dataRetentionDays: number;
  maxFileSize: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  allowGuestAccess: boolean;
  defaultLanguage: string;
  timezone: string;
  themeMode: string;
}

export default function SystemSettings() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'Community Management System',
    siteDescription: 'Comprehensive community management platform',
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    dataRetentionDays: 365,
    maxFileSize: 10,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowGuestAccess: false,
    defaultLanguage: 'en',
    timezone: 'Asia/Kuala_Lumpur',
    themeMode: 'light'
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: language === 'en' ? 'Settings Saved' : 'Tetapan Disimpan',
        description: language === 'en' ? 'System settings have been updated successfully.' : 'Tetapan sistem telah dikemaskini dengan jayanya.',
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to save settings.' : 'Gagal menyimpan tetapan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            {language === 'en' ? 'System Settings' : 'Tetapan Sistem'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Configure system-wide settings and preferences' : 'Konfigurasi tetapan dan keutamaan seluruh sistem'}
          </p>
        </div>
        
        {hasChanges && (
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? (language === 'en' ? 'Saving...' : 'Menyimpan...') : (language === 'en' ? 'Save Changes' : 'Simpan Perubahan')}
          </Button>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">{language === 'en' ? 'General' : 'Umum'}</TabsTrigger>
          <TabsTrigger value="security">{language === 'en' ? 'Security' : 'Keselamatan'}</TabsTrigger>
          <TabsTrigger value="notifications">{language === 'en' ? 'Notifications' : 'Pemberitahuan'}</TabsTrigger>
          <TabsTrigger value="data">{language === 'en' ? 'Data' : 'Data'}</TabsTrigger>
          <TabsTrigger value="appearance">{language === 'en' ? 'Appearance' : 'Penampilan'}</TabsTrigger>
          <TabsTrigger value="advanced">{language === 'en' ? 'Advanced' : 'Lanjutan'}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {language === 'en' ? 'Site Configuration' : 'Konfigurasi Laman'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Basic site information and settings' : 'Maklumat dan tetapan asas laman'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">
                    {language === 'en' ? 'Site Name' : 'Nama Laman'}
                  </Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => handleConfigChange('siteName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">
                    {language === 'en' ? 'Default Language' : 'Bahasa Lalai'}
                  </Label>
                  <select
                    id="defaultLanguage"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={config.defaultLanguage}
                    onChange={(e) => handleConfigChange('defaultLanguage', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="ms">Bahasa Malaysia</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">
                  {language === 'en' ? 'Site Description' : 'Penerangan Laman'}
                </Label>
                <Textarea
                  id="siteDescription"
                  value={config.siteDescription}
                  onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">
                  {language === 'en' ? 'Timezone' : 'Zon Masa'}
                </Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={config.timezone}
                  onChange={(e) => handleConfigChange('timezone', e.target.value)}
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {language === 'en' ? 'Maintenance Mode' : 'Mod Penyelenggaraan'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Enable to temporarily disable user access' : 'Dayakan untuk melumpuhkan akses pengguna buat sementara'}
                  </p>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {language === 'en' ? 'Security Settings' : 'Tetapan Keselamatan'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Configure authentication and security policies' : 'Konfigurasi pengesahan dan dasar keselamatan'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">
                    {language === 'en' ? 'Minimum Password Length' : 'Panjang Kata Laluan Minimum'}
                  </Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={config.passwordMinLength}
                    onChange={(e) => handleConfigChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    {language === 'en' ? 'Session Timeout (minutes)' : 'Tamat Tempoh Sesi (minit)'}
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={config.sessionTimeout}
                    onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {language === 'en' ? 'User Registration' : 'Pendaftaran Pengguna'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Allow new users to register accounts' : 'Benarkan pengguna baru mendaftar akaun'}
                    </p>
                  </div>
                  <Switch
                    checked={config.userRegistration}
                    onCheckedChange={(checked) => handleConfigChange('userRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {language === 'en' ? 'Require Two-Factor Authentication' : 'Memerlukan Pengesahan Dua Faktor'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Mandatory 2FA for all users' : '2FA wajib untuk semua pengguna'}
                    </p>
                  </div>
                  <Switch
                    checked={config.requireTwoFactor}
                    onCheckedChange={(checked) => handleConfigChange('requireTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {language === 'en' ? 'Allow Guest Access' : 'Benarkan Akses Tetamu'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Allow limited access without authentication' : 'Benarkan akses terhad tanpa pengesahan'}
                    </p>
                  </div>
                  <Switch
                    checked={config.allowGuestAccess}
                    onCheckedChange={(checked) => handleConfigChange('allowGuestAccess', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {language === 'en' ? 'Notification Settings' : 'Tetapan Pemberitahuan'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Configure system-wide notification preferences' : 'Konfigurasi keutamaan pemberitahuan seluruh sistem'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {language === 'en' ? 'Email Notifications' : 'Pemberitahuan E-mel'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Send notifications via email' : 'Hantar pemberitahuan melalui e-mel'}
                  </p>
                </div>
                <Switch
                  checked={config.emailNotifications}
                  onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {language === 'en' ? 'SMS Notifications' : 'Pemberitahuan SMS'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Send notifications via SMS' : 'Hantar pemberitahuan melalui SMS'}
                  </p>
                </div>
                <Switch
                  checked={config.smsNotifications}
                  onCheckedChange={(checked) => handleConfigChange('smsNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {language === 'en' ? 'Data Management' : 'Pengurusan Data'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Configure data retention and file handling' : 'Konfigurasi pengekalan data dan pengendalian fail'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetentionDays">
                    {language === 'en' ? 'Data Retention (days)' : 'Pengekalan Data (hari)'}
                  </Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    min="30"
                    max="3650"
                    value={config.dataRetentionDays}
                    onChange={(e) => handleConfigChange('dataRetentionDays', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">
                    {language === 'en' ? 'Max File Size (MB)' : 'Saiz Fail Maksimum (MB)'}
                  </Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    value={config.maxFileSize}
                    onChange={(e) => handleConfigChange('maxFileSize', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {language === 'en' ? 'Appearance Settings' : 'Tetapan Penampilan'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Customize the look and feel of the system' : 'Sesuaikan rupa dan rasa sistem'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="themeMode">
                  {language === 'en' ? 'Default Theme' : 'Tema Lalai'}
                </Label>
                <select
                  id="themeMode"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={config.themeMode}
                  onChange={(e) => handleConfigChange('themeMode', e.target.value)}
                >
                  <option value="light">{language === 'en' ? 'Light' : 'Cerah'}</option>
                  <option value="dark">{language === 'en' ? 'Dark' : 'Gelap'}</option>
                  <option value="system">{language === 'en' ? 'System' : 'Sistem'}</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {language === 'en' ? 'Advanced Settings' : 'Tetapan Lanjutan'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Advanced system configuration options' : 'Pilihan konfigurasi sistem lanjutan'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    {language === 'en' ? 'Warning' : 'Amaran'}
                  </span>
                </div>
                <p className="text-sm text-yellow-700">
                  {language === 'en' 
                    ? 'Advanced settings can affect system performance and security. Change with caution.'
                    : 'Tetapan lanjutan boleh menjejaskan prestasi dan keselamatan sistem. Ubah dengan berhati-hati.'}
                </p>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  {language === 'en' ? 'Export System Configuration' : 'Eksport Konfigurasi Sistem'}
                </Button>
                <Button variant="outline" className="w-full">
                  {language === 'en' ? 'Import System Configuration' : 'Import Konfigurasi Sistem'}
                </Button>
                <Button variant="destructive" className="w-full">
                  {language === 'en' ? 'Reset to Default Settings' : 'Set Semula ke Tetapan Lalai'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}