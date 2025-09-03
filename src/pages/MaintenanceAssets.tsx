import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Edit
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  description: string;
  asset_type: string;
  brand: string;
  model: string;
  serial_number: string;
  location: string;
  condition_status: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  warranty_expiry: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  maintenance_schedule: string;
  is_active: boolean;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export default function MaintenanceAssets() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    condition_status: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const fetchAssets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal memuat aset' : 'Failed to load assets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAssetMaintenance = async () => {
    if (!selectedAsset) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('assets')
        .update({
          condition_status: maintenanceForm.condition_status,
          last_maintenance_date: maintenanceForm.last_maintenance_date,
          next_maintenance_date: maintenanceForm.next_maintenance_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAsset.id);

      if (error) throw error;

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Rekod penyelenggaraan dikemas kini' : 'Maintenance record updated'
      });

      setSelectedAsset(null);
      setMaintenanceForm({
        condition_status: '',
        last_maintenance_date: '',
        next_maintenance_date: '',
        notes: ''
      });
      fetchAssets();
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal mengemas kini rekod' : 'Failed to update record',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter;
    const matchesCondition = conditionFilter === 'all' || asset.condition_status === conditionFilter;
    
    return matchesSearch && matchesType && matchesCondition;
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-success text-success-foreground';
      case 'good':
        return 'bg-primary text-primary-foreground';
      case 'fair':
        return 'bg-warning text-warning-foreground';
      case 'poor':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getMaintenanceStatus = (nextDate: string) => {
    if (!nextDate) return { status: 'unknown', color: 'bg-muted text-muted-foreground' };
    
    const today = new Date();
    const maintenance = new Date(nextDate);
    const daysDiff = Math.ceil((maintenance.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { status: 'overdue', color: 'bg-destructive text-destructive-foreground' };
    } else if (daysDiff <= 7) {
      return { status: 'due soon', color: 'bg-warning text-warning-foreground' };
    } else {
      return { status: 'scheduled', color: 'bg-success text-success-foreground' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ms' ? 'Pengurusan Aset' : 'Asset Management'}
        </h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: language === 'ms' ? 'Jumlah Aset' : 'Total Assets',
            value: assets.length,
            icon: Package,
            color: 'text-primary'
          },
          {
            title: language === 'ms' ? 'Perlu Penyelenggaraan' : 'Maintenance Due',
            value: assets.filter(a => {
              const status = getMaintenanceStatus(a.next_maintenance_date);
              return status.status === 'overdue' || status.status === 'due soon';
            }).length,
            icon: AlertTriangle,
            color: 'text-warning'
          },
          {
            title: language === 'ms' ? 'Kondisi Baik' : 'Good Condition',
            value: assets.filter(a => a.condition_status === 'good' || a.condition_status === 'excellent').length,
            icon: CheckCircle,
            color: 'text-success'
          },
          {
            title: language === 'ms' ? 'Nilai Keseluruhan' : 'Total Value',
            value: `RM ${assets.reduce((sum, a) => sum + (a.current_value || 0), 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-primary'
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ms' ? 'Cari aset...' : 'Search assets...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="facility">Facility</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <div className="grid gap-4">
        {filteredAssets.map((asset) => {
          const maintenanceStatus = getMaintenanceStatus(asset.next_maintenance_date);
          
          return (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription>
                      {asset.brand} {asset.model} - {asset.serial_number}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {asset.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {asset.asset_type}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getConditionColor(asset.condition_status)}>
                      {asset.condition_status.toUpperCase()}
                    </Badge>
                    <Badge className={maintenanceStatus.color}>
                      {maintenanceStatus.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ms' ? 'Penyelenggaraan Terakhir' : 'Last Maintenance'}
                    </p>
                    <p className="font-medium">
                      {asset.last_maintenance_date 
                        ? new Date(asset.last_maintenance_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ms' ? 'Penyelenggaraan Seterusnya' : 'Next Maintenance'}
                    </p>
                    <p className="font-medium">
                      {asset.next_maintenance_date 
                        ? new Date(asset.next_maintenance_date).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ms' ? 'Nilai Semasa' : 'Current Value'}
                    </p>
                    <p className="font-medium">
                      RM {asset.current_value?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setMaintenanceForm({
                            condition_status: asset.condition_status,
                            last_maintenance_date: asset.last_maintenance_date || '',
                            next_maintenance_date: asset.next_maintenance_date || '',
                            notes: ''
                          });
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {language === 'ms' ? 'Kemas Kini' : 'Update Maintenance'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {language === 'ms' ? 'Kemas Kini Penyelenggaraan' : 'Update Maintenance'}
                        </DialogTitle>
                        <DialogDescription>{asset.name}</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            {language === 'ms' ? 'Status Kondisi' : 'Condition Status'}
                          </label>
                          <Select 
                            value={maintenanceForm.condition_status} 
                            onValueChange={(value) => setMaintenanceForm(prev => ({...prev, condition_status: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            {language === 'ms' ? 'Tarikh Penyelenggaraan Terakhir' : 'Last Maintenance Date'}
                          </label>
                          <Input
                            type="date"
                            value={maintenanceForm.last_maintenance_date}
                            onChange={(e) => setMaintenanceForm(prev => ({...prev, last_maintenance_date: e.target.value}))}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            {language === 'ms' ? 'Tarikh Penyelenggaraan Seterusnya' : 'Next Maintenance Date'}
                          </label>
                          <Input
                            type="date"
                            value={maintenanceForm.next_maintenance_date}
                            onChange={(e) => setMaintenanceForm(prev => ({...prev, next_maintenance_date: e.target.value}))}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            {language === 'ms' ? 'Nota' : 'Notes'}
                          </label>
                          <Textarea
                            placeholder={language === 'ms' ? 'Masukkan nota penyelenggaraan...' : 'Enter maintenance notes...'}
                            value={maintenanceForm.notes}
                            onChange={(e) => setMaintenanceForm(prev => ({...prev, notes: e.target.value}))}
                          />
                        </div>
                        
                        <Button 
                          onClick={updateAssetMaintenance}
                          disabled={isUpdating}
                          className="w-full"
                        >
                          {isUpdating 
                            ? (language === 'ms' ? 'Mengemas kini...' : 'Updating...') 
                            : (language === 'ms' ? 'Kemas Kini' : 'Update')
                          }
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'ms' ? 'Tiada Aset Dijumpai' : 'No Assets Found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ms' 
                ? 'Tiada aset yang sepadan dengan kriteria carian anda.'
                : 'No assets match your search criteria.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}