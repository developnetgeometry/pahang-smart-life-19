import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: 'maintenance' | 'noise' | 'security' | 'facilities' | 'parking' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'investigating' | 'in-progress' | 'resolved' | 'closed';
  submittedBy: string;
  assignedTo?: string;
  location?: string;
  createdDate: string;
  updatedDate: string;
  resolution?: string;
}

export default function ComplaintsManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const text = {
    en: {
      title: 'Complaints Management',
      subtitle: 'Manage resident complaints and feedback',
      all: 'All Complaints',
      pending: 'Pending',
      investigating: 'Investigating',
      resolved: 'Resolved',
      search: 'Search complaints...',
      status: 'Status',
      category: 'Category',
      allStatus: 'All Status',
      allCategories: 'All Categories',
      inProgress: 'In Progress',
      closed: 'Closed',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      maintenance: 'Maintenance',
      noise: 'Noise',
      security: 'Security',
      facilities: 'Facilities',
      parking: 'Parking',
      other: 'Other',
      subject: 'Subject',
      description: 'Description',
      submittedBy: 'Submitted By',
      assignedTo: 'Assigned To',
      location: 'Location',
      createdDate: 'Created Date',
      updatedDate: 'Updated Date',
      resolution: 'Resolution',
      actions: 'Actions',
      view: 'View Details',
      assign: 'Assign',
      resolve: 'Resolve',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      totalComplaints: 'Total Complaints',
      pendingComplaints: 'Pending',
      resolvedToday: 'Resolved Today',
      avgResolution: 'Avg Resolution Time',
      complaintResolved: 'Complaint resolved successfully!',
      complaintAssigned: 'Complaint assigned successfully!',
      complaintClosed: 'Complaint closed successfully!'
    },
    ms: {
      title: 'Pengurusan Aduan',
      subtitle: 'Urus aduan dan maklum balas penduduk',
      all: 'Semua Aduan',
      pending: 'Menunggu',
      investigating: 'Menyiasat',
      resolved: 'Selesai',
      search: 'Cari aduan...',
      status: 'Status',
      category: 'Kategori',
      allStatus: 'Semua Status',
      allCategories: 'Semua Kategori',
      inProgress: 'Dalam Proses',
      closed: 'Ditutup',
      priority: 'Keutamaan',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      urgent: 'Segera',
      maintenance: 'Penyelenggaraan',
      noise: 'Bunyi Bising',
      security: 'Keselamatan',
      facilities: 'Kemudahan',
      parking: 'Tempat Letak Kereta',
      other: 'Lain-lain',
      subject: 'Subjek',
      description: 'Penerangan',
      submittedBy: 'Dikemukakan Oleh',
      assignedTo: 'Ditugaskan Kepada',
      location: 'Lokasi',
      createdDate: 'Tarikh Dicipta',
      updatedDate: 'Tarikh Dikemaskini',
      resolution: 'Penyelesaian',
      actions: 'Tindakan',
      view: 'Lihat Butiran',
      assign: 'Tugaskan',
      resolve: 'Selesaikan',
      close: 'Tutup',
      edit: 'Edit',
      delete: 'Padam',
      totalComplaints: 'Jumlah Aduan',
      pendingComplaints: 'Menunggu',
      resolvedToday: 'Selesai Hari Ini',
      avgResolution: 'Purata Masa Penyelesaian',
      complaintResolved: 'Aduan berjaya diselesaikan!',
      complaintAssigned: 'Aduan berjaya ditugaskan!',
      complaintClosed: 'Aduan berjaya ditutup!'
    }
  };

  const t = text[language];

  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      subject: language === 'en' ? 'Loud music from neighbor' : 'Muzik kuat dari jiran',
      description: language === 'en' ? 'Neighbor playing loud music late at night' : 'Jiran memainkan muzik kuat pada waktu malam',
      category: 'noise',
      priority: 'medium',
      status: 'investigating',
      submittedBy: 'John Doe',
      assignedTo: 'Security Team',
      location: 'Block A, Unit 15-02',
      createdDate: '2024-01-20',
      updatedDate: '2024-01-20'
    },
    {
      id: '2',
      subject: language === 'en' ? 'Broken elevator in Block B' : 'Lif rosak di Blok B',
      description: language === 'en' ? 'Elevator not working for 3 days' : 'Lif tidak berfungsi selama 3 hari',
      category: 'maintenance',
      priority: 'high',
      status: 'in-progress',
      submittedBy: 'Sarah Chen',
      assignedTo: 'Maintenance Team',
      location: 'Block B',
      createdDate: '2024-01-18',
      updatedDate: '2024-01-19'
    },
    {
      id: '3',
      subject: language === 'en' ? 'Parking space occupied illegally' : 'Tempat letak kereta diduduki secara haram',
      description: language === 'en' ? 'Unknown car parked in my designated space' : 'Kereta tidak dikenali diletakkan di tempat saya',
      category: 'parking',
      priority: 'low',
      status: 'resolved',
      submittedBy: 'Mike Wong',
      assignedTo: 'Security Team',
      location: 'Parking Level B1',
      createdDate: '2024-01-15',
      updatedDate: '2024-01-17',
      resolution: language === 'en' ? 'Car owner contacted and vehicle removed' : 'Pemilik kereta dihubungi dan kenderaan dialihkan'
    }
  ]);

  const categories = [
    { value: 'all', label: t.allCategories },
    { value: 'maintenance', label: t.maintenance },
    { value: 'noise', label: t.noise },
    { value: 'security', label: t.security },
    { value: 'facilities', label: t.facilities },
    { value: 'parking', label: t.parking },
    { value: 'other', label: t.other }
  ];

  const statuses = [
    { value: 'all', label: t.allStatus },
    { value: 'pending', label: t.pending },
    { value: 'investigating', label: t.investigating },
    { value: 'in-progress', label: t.inProgress },
    { value: 'resolved', label: t.resolved },
    { value: 'closed', label: t.closed }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'investigating': return t.investigating;
      case 'in-progress': return t.inProgress;
      case 'resolved': return t.resolved;
      case 'closed': return t.closed;
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return t.low;
      case 'medium': return t.medium;
      case 'high': return t.high;
      case 'urgent': return t.urgent;
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'maintenance': return t.maintenance;
      case 'noise': return t.noise;
      case 'security': return t.security;
      case 'facilities': return t.facilities;
      case 'parking': return t.parking;
      case 'other': return t.other;
      default: return category;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || complaint.category === selectedCategory;
    const matchesTab = activeTab === 'all' || complaint.status === activeTab;
    return matchesSearch && matchesStatus && matchesCategory && matchesTab;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    avgDays: 2.5
  };

  const handleResolve = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved', updatedDate: new Date().toISOString().slice(0,10) } : c));
    toast({
      title: t.complaintResolved,
    });
  };

  const handleAssign = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'pending' ? 'investigating' : 'in-progress', assignedTo: 'Team' } : c));
    toast({
      title: t.complaintAssigned,
    });
  };

  const handleClose = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'closed', updatedDate: new Date().toISOString().slice(0,10) } : c));
    toast({ title: t.complaintClosed });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalComplaints}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pendingComplaints}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.resolvedToday}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgResolution}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDays} days</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="pending">{t.pending}</TabsTrigger>
          <TabsTrigger value="investigating">{t.investigating}</TabsTrigger>
          <TabsTrigger value="resolved">{t.resolved}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{complaint.subject}</h4>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {complaint.submittedBy}
                        </div>
                        {complaint.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {complaint.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {complaint.createdDate}
                        </div>
                        <span>
                          {getCategoryText(complaint.category)}
                        </span>
                      </div>
                      {complaint.resolution && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                          <strong>Resolution:</strong> {complaint.resolution}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {getPriorityText(complaint.priority)}
                      </Badge>
                      <Badge className={getStatusColor(complaint.status)}>
                        {getStatusText(complaint.status)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAssign(complaint.id)}>
                          {t.assign}
                        </Button>
                        {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                          <Button variant="outline" size="sm" onClick={() => handleResolve(complaint.id)}>
                            {t.resolve}
                          </Button>
                        )}
                        {complaint.status === 'resolved' && (
                          <Button variant="outline" size="sm" onClick={() => handleClose(complaint.id)}>
                            {t.close}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}