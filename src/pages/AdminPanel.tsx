import { useState } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface DashboardStats {
  totalResidents: number;
  totalComplaints: number;
  pendingApprovals: number;
  facilityBookings: number;
}

interface Resident {
  id: string;
  name: string;
  unit: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

interface Complaint {
  id: string;
  resident: string;
  category: string;
  subject: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
}

export default function AdminPanel() {
  const { language } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const text = {
    en: {
      title: 'Admin Panel',
      subtitle: 'Manage community operations and residents',
      overview: 'Overview',
      residents: 'Residents',
      complaints: 'Complaints',
      facilities: 'Facilities',
      reports: 'Reports',
      totalResidents: 'Total Residents',
      totalComplaints: 'Total Complaints',
      pendingApprovals: 'Pending Approvals',
      facilityBookings: 'Facility Bookings',
      search: 'Search...',
      filter: 'Filter',
      export: 'Export',
      viewDetails: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      recent: 'Recent',
      thisMonth: 'This Month',
      growth: 'Growth',
      decline: 'Decline',
      unit: 'Unit',
      joinDate: 'Join Date',
      createdDate: 'Created Date',
      category: 'Category',
      subject: 'Subject',
      resident: 'Resident'
    },
    ms: {
      title: 'Panel Admin',
      subtitle: 'Urus operasi komuniti dan penduduk',
      overview: 'Gambaran Keseluruhan',
      residents: 'Penduduk',
      complaints: 'Aduan',
      facilities: 'Kemudahan',
      reports: 'Laporan',
      totalResidents: 'Jumlah Penduduk',
      totalComplaints: 'Jumlah Aduan',
      pendingApprovals: 'Menunggu Kelulusan',
      facilityBookings: 'Tempahan Kemudahan',
      search: 'Cari...',
      filter: 'Tapis',
      export: 'Eksport',
      viewDetails: 'Lihat Butiran',
      edit: 'Edit',
      delete: 'Padam',
      status: 'Status',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      pending: 'Menunggu',
      inProgress: 'Dalam Proses',
      resolved: 'Selesai',
      priority: 'Keutamaan',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      recent: 'Terkini',
      thisMonth: 'Bulan Ini',
      growth: 'Pertumbuhan',
      decline: 'Penurunan',
      unit: 'Unit',
      joinDate: 'Tarikh Sertai',
      createdDate: 'Tarikh Dicipta',
      category: 'Kategori',
      subject: 'Subjek',
      resident: 'Penduduk'
    }
  };

  const t = text[language];

  const dashboardStats: DashboardStats = {
    totalResidents: 245,
    totalComplaints: 18,
    pendingApprovals: 7,
    facilityBookings: 32
  };

  const mockResidents: Resident[] = [
    {
      id: '1',
      name: 'John Doe',
      unit: 'A-15-02',
      email: 'john.doe@email.com',
      phone: '+60123456789',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      unit: 'B-08-01',
      email: 'sarah.chen@email.com',
      phone: '+60198765432',
      status: 'active',
      joinDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Mike Wong',
      unit: 'C-12-05',
      email: 'mike.wong@email.com',
      phone: '+60187654321',
      status: 'pending',
      joinDate: '2024-01-20'
    }
  ];

  const mockComplaints: Complaint[] = [
    {
      id: '1',
      resident: 'John Doe',
      category: language === 'en' ? 'Maintenance' : 'Penyelenggaraan',
      subject: language === 'en' ? 'Air conditioning not working' : 'Penghawa dingin tidak berfungsi',
      status: 'pending',
      priority: 'high',
      createdDate: '2024-01-20'
    },
    {
      id: '2',
      resident: 'Sarah Chen',
      category: language === 'en' ? 'Noise' : 'Bunyi',
      subject: language === 'en' ? 'Loud music from neighbor' : 'Muzik kuat dari jiran',
      status: 'in-progress',
      priority: 'medium',
      createdDate: '2024-01-18'
    },
    {
      id: '3',
      resident: 'Mike Wong',
      category: language === 'en' ? 'Security' : 'Keselamatan',
      subject: language === 'en' ? 'Broken security camera' : 'Kamera keselamatan rosak',
      status: 'resolved',
      priority: 'low',
      createdDate: '2024-01-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'inactive': return t.inactive;
      case 'pending': return t.pending;
      case 'in-progress': return t.inProgress;
      case 'resolved': return t.resolved;
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="residents">{t.residents}</TabsTrigger>
          <TabsTrigger value="complaints">{t.complaints}</TabsTrigger>
          <TabsTrigger value="facilities">{t.facilities}</TabsTrigger>
          <TabsTrigger value="reports">{t.reports}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalResidents}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalResidents}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12% {t.thisMonth}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalComplaints}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalComplaints}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  -8% {t.thisMonth}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.pendingApprovals}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingApprovals}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-yellow-500" />
                  +3% {t.thisMonth}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.facilityBookings}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.facilityBookings}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +25% {t.thisMonth}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.recent} {t.residents}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockResidents.slice(0, 3).map((resident) => (
                    <div key={resident.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {resident.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{resident.name}</p>
                        <p className="text-xs text-muted-foreground">{resident.unit}</p>
                      </div>
                      <Badge className={getStatusColor(resident.status)}>
                        {getStatusText(resident.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.recent} {t.complaints}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockComplaints.slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{complaint.subject}</p>
                          <p className="text-xs text-muted-foreground">{complaint.resident}</p>
                        </div>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {getPriorityText(complaint.priority)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="residents" className="space-y-6">
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
            <Select>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t.filter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="inactive">{t.inactive}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.residents} Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResidents.map((resident) => (
                  <div key={resident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {resident.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{resident.name}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{t.unit}: {resident.unit}</p>
                          <p>Email: {resident.email}</p>
                          <p>Phone: {resident.phone}</p>
                          <p>{t.joinDate}: {resident.joinDate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(resident.status)}>
                        {getStatusText(resident.status)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.complaints} Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{complaint.subject}</h4>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <p>{t.resident}: {complaint.resident}</p>
                        <p>{t.category}: {complaint.category}</p>
                        <p>{t.createdDate}: {complaint.createdDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(complaint.status)}>
                        {getStatusText(complaint.status)}
                      </Badge>
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {getPriorityText(complaint.priority)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t.facilities} management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t.reports} section coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}