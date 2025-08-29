import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, Clock, Plus, MessageSquare, Camera, Wrench, Zap, Droplets } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  assigned_to?: string;
  photos?: string[];
  location: string;
  complainant_id: string;
}

export default function MyComplaints() {
  const { language, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNewComplaintDialog, setShowNewComplaintDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium' as const,
    location: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('complainant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedComplaints = data?.map(complaint => ({
        ...complaint,
        created_at: new Date(complaint.created_at).toLocaleDateString()
      })) || [];
      
      setComplaints(formattedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to load complaints' : 'Gagal memuatkan aduan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('complaints')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          location: formData.location,
          complainant_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' ? 'Complaint submitted successfully' : 'Aduan berjaya dihantar',
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        category: '',
        priority: 'medium',
        location: '',
        description: ''
      });
      setShowNewComplaintDialog(false);
      
      // Refresh complaints list
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to submit complaint' : 'Gagal menghantar aduan',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
      case 'investigating': return 'bg-purple-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    if (language === 'en') {
      switch (priority) {
        case 'low': return 'Low';
        case 'medium': return 'Medium';
        case 'high': return 'High';
        case 'urgent': return 'Urgent';
        default: return 'Unknown';
      }
    } else {
      switch (priority) {
        case 'low': return 'Rendah';
        case 'medium': return 'Sederhana';
        case 'high': return 'Tinggi';
        case 'urgent': return 'Mendesak';
        default: return 'Tidak Diketahui';
      }
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'pending': return 'Pending';
        case 'investigating': return 'Investigating';
        case 'in_progress': return 'In Progress';
        case 'resolved': return 'Resolved';
        case 'closed': return 'Closed';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'pending': return 'Menunggu';
        case 'investigating': return 'Menyiasat';
        case 'in_progress': return 'Dalam Proses';
        case 'resolved': return 'Diselesaikan';
        case 'closed': return 'Ditutup';
        default: return 'Tidak Diketahui';
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'maintenance':
      case 'penyelenggaraan':
        return <Wrench className="w-4 h-4" />;
      case 'infrastructure':
      case 'infrastruktur':
        return <Zap className="w-4 h-4" />;
      case 'plumbing':
      case 'paip':
        return <Droplets className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsDialog(true);
  };

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
        <Dialog open={showNewComplaintDialog} onOpenChange={setShowNewComplaintDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
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
              <div className="space-y-2">
                <Label htmlFor="category">
                  {language === 'en' ? 'Category' : 'Kategori'}
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select category' : 'Pilih kategori'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">{language === 'en' ? 'Maintenance' : 'Penyelenggaraan'}</SelectItem>
                    <SelectItem value="infrastructure">{language === 'en' ? 'Infrastructure' : 'Infrastruktur'}</SelectItem>
                    <SelectItem value="plumbing">{language === 'en' ? 'Plumbing' : 'Paip'}</SelectItem>
                    <SelectItem value="electrical">{language === 'en' ? 'Electrical' : 'Elektrik'}</SelectItem>
                    <SelectItem value="security">{language === 'en' ? 'Security' : 'Keselamatan'}</SelectItem>
                    <SelectItem value="cleaning">{language === 'en' ? 'Cleaning' : 'Pembersihan'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">
                  {language === 'en' ? 'Priority Level' : 'Tahap Keutamaan'}
                </Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select priority' : 'Pilih keutamaan'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{language === 'en' ? 'Low' : 'Rendah'}</SelectItem>
                    <SelectItem value="medium">{language === 'en' ? 'Medium' : 'Sederhana'}</SelectItem>
                    <SelectItem value="high">{language === 'en' ? 'High' : 'Tinggi'}</SelectItem>
                    <SelectItem value="urgent">{language === 'en' ? 'Urgent' : 'Mendesak'}</SelectItem>
                  </SelectContent>
                </Select>
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
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Click to upload photos' : 'Klik untuk muat naik foto'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSubmitComplaint}
                disabled={submitting || !formData.title || !formData.category || !formData.location || !formData.description}
                className="w-full bg-gradient-primary"
              >
                {submitting ? (language === 'en' ? 'Submitting...' : 'Menghantar...') : (language === 'en' ? 'Submit Complaint' : 'Hantar Aduan')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Complaint Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Complaint Details' : 'Butiran Aduan'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Complete information about this complaint'
                : 'Maklumat lengkap tentang aduan ini'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'en' ? 'Issue Title' : 'Tajuk Masalah'}
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedComplaint.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Category' : 'Kategori'}
                  </Label>
                  <div className="p-3 bg-muted rounded-md flex items-center space-x-2">
                    {getCategoryIcon(selectedComplaint.category)}
                    <span className="text-sm">{selectedComplaint.category}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Priority Level' : 'Tahap Keutamaan'}
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <Badge className={`${getPriorityColor(selectedComplaint.priority)} text-white`}>
                      {getPriorityText(selectedComplaint.priority)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'en' ? 'Location' : 'Lokasi'}
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedComplaint.location}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'en' ? 'Detailed Description' : 'Penerangan Terperinci'}
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedComplaint.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Status' : 'Status'}
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <Badge className={`${getStatusColor(selectedComplaint.status)} text-white`}>
                      {getStatusText(selectedComplaint.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Date Submitted' : 'Tarikh Dihantar'}
                  </Label>
                  <div className="p-3 bg-muted rounded-md flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{selectedComplaint.created_at}</span>
                  </div>
                </div>
              </div>
              
              {selectedComplaint.assigned_to && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'en' ? 'Assigned To' : 'Ditugaskan Kepada'}
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-blue-600">{selectedComplaint.assigned_to}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'en' ? 'Photos' : 'Foto'}
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  {selectedComplaint.photos && selectedComplaint.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedComplaint.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>{language === 'en' ? 'No photos attached' : 'Tiada foto dilampirkan'}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
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
                  {language === 'en' ? 'In Progress' : 'Dalam Proses'}
                </p>
                <p className="text-2xl font-bold">{complaints.filter(c => c.status === 'in_progress' || c.status === 'investigating').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Resolved' : 'Diselesaikan'}
                </p>
                <p className="text-2xl font-bold">{complaints.filter(c => c.status === 'resolved').length}</p>
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
                  {language === 'en' ? 'High Priority' : 'Keutamaan Tinggi'}
                </p>
                <p className="text-2xl font-bold">{complaints.filter(c => c.priority === 'high' || c.priority === 'urgent').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {language === 'en' ? 'Loading complaints...' : 'Memuatkan aduan...'}
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'No Complaints Found' : 'Tiada Aduan Dijumpai'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'en' ? 'You haven\'t submitted any complaints yet.' : 'Anda belum menghantar sebarang aduan lagi.'}
              </p>
              <Button 
                onClick={() => setShowNewComplaintDialog(true)}
                className="bg-gradient-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Submit First Complaint' : 'Hantar Aduan Pertama'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
          <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getCategoryIcon(complaint.category)}
                    <span>{complaint.title}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {complaint.created_at}
                    </span>
                    <span>{complaint.location}</span>
                    {complaint.assigned_to && (
                      <span className="text-blue-600">
                        {language === 'en' ? 'Assigned to' : 'Ditugaskan kepada'}: {complaint.assigned_to}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={`${getPriorityColor(complaint.priority)} text-white`}>
                    {getPriorityText(complaint.priority)}
                  </Badge>
                  <Badge className={`${getStatusColor(complaint.status)} text-white`}>
                    {getStatusText(complaint.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {complaint.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">
                    {language === 'en' ? 'Category:' : 'Kategori:'}
                  </span> {complaint.category}
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(complaint)}
                  >
                    {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                  </Button>
                  {complaint.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      {language === 'en' ? 'Edit' : 'Edit'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            </Card>
          ))
        )}
      </div>

      {complaints.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'en' ? 'No complaints submitted' : 'Tiada aduan dihantar'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Report any issues with facilities or services to get them resolved quickly.'
                : 'Laporkan sebarang masalah dengan kemudahan atau perkhidmatan untuk menyelesaikannya dengan cepat.'
              }
            </p>
            <Button className="bg-gradient-primary" onClick={() => setShowNewComplaintDialog(true)}>
              {language === 'en' ? 'Submit first complaint' : 'Hantar aduan pertama'}
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
  );
}