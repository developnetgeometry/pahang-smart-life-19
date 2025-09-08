import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Clock, AlertTriangle, CheckCircle, Upload, X, Loader2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ComplaintEscalationPanel from '@/components/complaints/ComplaintEscalationPanel';
import RealTimeNotificationCenter from '@/components/notifications/RealTimeNotificationCenter';
import ComplaintResponseHistory from '@/components/complaints/ComplaintResponseHistory';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  photos?: string[];
  escalation_level: number;
  escalated_at?: string;
  escalated_by?: string;
  auto_escalated?: boolean;
  location?: string;
}

export default function MyComplaints() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user, refreshKey]);

  const fetchComplaints = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('complainant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedComplaints: Complaint[] = (data || []).map(complaint => ({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
        photos: complaint.photos || [],
        escalation_level: complaint.escalation_level || 0,
        escalated_at: complaint.escalated_at,
        escalated_by: complaint.escalated_by,
        auto_escalated: complaint.auto_escalated || false,
        location: complaint.location
      }));

      setComplaints(transformedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: language === 'en' ? 'Error loading complaints' : 'Ralat memuatkan aduan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Get comprehensive user profile data for logging
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('district_id, community_id, full_name, phone, unit_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      console.log('Submitting complaint with complainant details:', {
        complainant_id: user.id,
        complainant_name: profileData.full_name,
        complainant_phone: profileData.phone,
        complainant_unit: profileData.unit_number,
        district_id: profileData.district_id,
        community_id: profileData.community_id
      });

      const { error } = await supabase
        .from('complaints')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          location: formData.location,
          complainant_id: user.id,
          district_id: profileData.district_id,
          status: 'pending',
          photos: uploadedPhotos.length > 0 ? uploadedPhotos : null
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Complaint submitted successfully' : 'Aduan berjaya dihantar',
        description: language === 'en' 
          ? 'Your complaint has been logged and will be reviewed by the appropriate team.'
          : 'Aduan anda telah direkodkan dan akan dikaji oleh pasukan yang berkenaan.'
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        priority: 'medium',
        location: '',
        description: ''
      });
      setUploadedPhotos([]);
      setIsCreateOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: language === 'en' ? 'Error submitting complaint' : 'Ralat menghantar aduan',
        description: language === 'en' 
          ? 'Failed to submit complaint. Please check your information and try again.'
          : 'Gagal menghantar aduan. Sila semak maklumat anda dan cuba lagi.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('complaint-photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('complaint-photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const photoUrls = await Promise.all(uploadPromises);
      setUploadedPhotos(prev => [...prev, ...photoUrls]);
      
      toast({
        title: language === 'en' ? 'Photos uploaded successfully' : 'Foto berjaya dimuat naik',
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: language === 'en' ? 'Error uploading photos' : 'Ralat memuat naik foto',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getEscalationBadge = (complaint: Complaint) => {
    if (complaint.escalation_level === 0) return null;
    
    return (
      <Badge variant="destructive" className="text-xs">
        Escalated L{complaint.escalation_level}
        {complaint.auto_escalated && ' (Auto)'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-muted animate-pulse rounded mb-2 w-48"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96"></div>
          </div>
          <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'My Complaints' : 'Aduan Saya'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Track and manage your maintenance requests'
              : 'Jejak dan urus permintaan penyelenggaraan anda'
            }
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'New Complaint' : 'Aduan Baru'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Submit New Complaint' : 'Hantar Aduan Baru'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' 
                  ? 'Describe your issue and we\'ll assign it to the appropriate team'
                  : 'Terangkan masalah anda dan kami akan menugaskannya kepada pasukan yang sesuai'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {language === 'en' ? 'Issue Title' : 'Tajuk Masalah'}
                </Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === 'en' ? 'Brief description of the issue' : 'Penerangan ringkas masalah'} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {language === 'en' ? 'Category' : 'Kategori'}
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select category' : 'Pilih kategori'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">
                        <div className="flex flex-col">
                          <span>{language === 'en' ? 'Maintenance' : 'Penyelenggaraan'}</span>
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Assigned to maintenance staff' : 'Diserahkan kepada kakitangan penyelenggaraan'}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="security">
                        <div className="flex flex-col">
                          <span>{language === 'en' ? 'Security' : 'Keselamatan'}</span>
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Assigned to security officers' : 'Diserahkan kepada pegawai keselamatan'}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="facilities">
                        <div className="flex flex-col">
                          <span>{language === 'en' ? 'Facilities' : 'Kemudahan'}</span>
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Assigned to facility managers' : 'Diserahkan kepada pengurus kemudahan'}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="noise">
                        <div className="flex flex-col">
                          <span>{language === 'en' ? 'Noise' : 'Bunyi Bising'}</span>
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Assigned to community admin' : 'Diserahkan kepada pentadbir komuniti'}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="general">
                        <div className="flex flex-col">
                          <span>{language === 'en' ? 'General' : 'Umum'}</span>
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Assigned to community admin' : 'Diserahkan kepada pentadbir komuniti'}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' 
                      ? 'Your complaint will be automatically assigned to the appropriate team based on category'
                      : 'Aduan anda akan diserahkan secara automatik kepada pasukan yang sesuai berdasarkan kategori'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    {language === 'en' ? 'Priority Level' : 'Tahap Keutamaan'}
                  </Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{language === 'en' ? 'Low' : 'Rendah'}</SelectItem>
                      <SelectItem value="medium">{language === 'en' ? 'Medium' : 'Sederhana'}</SelectItem>
                      <SelectItem value="high">{language === 'en' ? 'High' : 'Tinggi'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">
                  {language === 'en' ? 'Location' : 'Lokasi'}
                </Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={language === 'en' ? 'e.g., Block A, Unit 12-3, Common Area' : 'cth: Blok A, Unit 12-3, Kawasan Umum'} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  {language === 'en' ? 'Detailed Description' : 'Penerangan Terperinci'}
                </Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === 'en' ? 'Please provide detailed information about the issue...' : 'Sila berikan maklumat terperinci tentang masalah...'} 
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>
                  {language === 'en' ? 'Photos (Optional)' : 'Foto (Pilihan)'}
                </Label>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {uploading 
                          ? (language === 'en' ? 'Uploading...' : 'Memuat naik...')
                          : (language === 'en' ? 'Click to upload photos' : 'Klik untuk muat naik foto')
                        }
                      </p>
                    </label>
                  </div>
                  
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedPhotos.map((photoUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photoUrl} 
                            alt={`Complaint photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photoUrl)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  disabled={submitting}
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </Button>
                <Button 
                  onClick={handleSubmitComplaint}
                  disabled={submitting || !formData.title || !formData.category || !formData.location || !formData.description}
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {language === 'en' ? 'Submit' : 'Hantar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Total' : 'Jumlah'}
                    </p>
                    <p className="text-2xl font-bold">{complaints.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Pending' : 'Menunggu'}
                    </p>
                    <p className="text-2xl font-bold">
                      {complaints.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Escalated' : 'Dinaikraf'}
                    </p>
                    <p className="text-2xl font-bold">
                      {complaints.filter(c => c.escalation_level > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Resolved' : 'Diselesaikan'}
                    </p>
                    <p className="text-2xl font-bold">
                      {complaints.filter(c => c.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'en' ? 'No complaints yet' : 'Tiada aduan lagi'}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {language === 'en' 
                      ? 'Submit your first complaint to get started'
                      : 'Hantar aduan pertama anda untuk bermula'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              complaints.map((complaint) => (
                <Card 
                  key={complaint.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedComplaint?.id === complaint.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => navigate(`/complaint/${complaint.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{complaint.title}</h3>
                          <div className="flex items-center space-x-2">
                            {getEscalationBadge(complaint)}
                            <Badge className={`text-white ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                          <Badge className={`text-white ${getStatusColor(complaint.status)} shadow-community`}>
                            {complaint.status}
                          </Badge>
                          <span>{complaint.category}</span>
                          {complaint.location && <span>📍 {complaint.location}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <RealTimeNotificationCenter />
          
          {selectedComplaint && (
            <ComplaintEscalationPanel
              complaintId={selectedComplaint.id}
              currentEscalationLevel={selectedComplaint.escalation_level}
              category={selectedComplaint.category}
              title={selectedComplaint.title}
              status={selectedComplaint.status}
              createdAt={selectedComplaint.created_at}
              escalatedAt={selectedComplaint.escalated_at}
              autoEscalated={selectedComplaint.auto_escalated}
              onEscalationChange={() => setRefreshKey(prev => prev + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}