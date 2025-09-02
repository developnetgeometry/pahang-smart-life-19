import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  DollarSign,
  Package,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image: string;
  stock_quantity: number;
  sold_count: number;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
}

export default function SellerDashboard() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalViews: 0
  });

  const isServiceProvider = hasRole('service_provider');

  const text = {
    en: {
      title: 'Seller Dashboard',
      subtitle: 'Manage your marketplace listings and track performance',
      overview: 'Overview',
      myListings: 'My Listings',
      createListing: 'Create New Listing',
      totalListings: 'Total Listings',
      activeListings: 'Active Listings',
      totalSales: 'Total Sales',
      totalRevenue: 'Total Revenue',
      totalViews: 'Total Views',
      noListings: 'No listings yet',
      noListingsDesc: 'Create your first listing to start selling',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      views: 'Views',
      sold: 'Sold',
      stock: 'Stock',
      price: 'Price',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      activate: 'Activate',
      deactivate: 'Deactivate',
      deleteConfirm: 'Are you sure you want to delete this listing?',
      deleteSuccess: 'Listing deleted successfully',
      deleteError: 'Failed to delete listing',
      updateSuccess: 'Listing updated successfully',
      updateError: 'Failed to update listing',
      accessDenied: 'Access Denied',
      accessDeniedDesc: 'Only service providers can access the seller dashboard'
    },
    ms: {
      title: 'Papan Pemuka Penjual',
      subtitle: 'Uruskan senarai marketplace dan jejak prestasi anda',
      overview: 'Gambaran Keseluruhan',
      myListings: 'Senarai Saya',
      createListing: 'Cipta Senarai Baru',
      totalListings: 'Jumlah Senarai',
      activeListings: 'Senarai Aktif',
      totalSales: 'Jumlah Jualan',
      totalRevenue: 'Jumlah Pendapatan',
      totalViews: 'Jumlah Paparan',
      noListings: 'Belum ada senarai',
      noListingsDesc: 'Cipta senarai pertama anda untuk mula menjual',
      status: 'Status',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      views: 'Paparan',
      sold: 'Dijual',
      stock: 'Stok',
      price: 'Harga',
      actions: 'Tindakan',
      edit: 'Edit',
      delete: 'Padam',
      view: 'Lihat',
      activate: 'Aktifkan',
      deactivate: 'Nyahaktifkan',
      deleteConfirm: 'Adakah anda pasti mahu memadamkan senarai ini?',
      deleteSuccess: 'Senarai berjaya dipadamkan',
      deleteError: 'Gagal memadamkan senarai',
      updateSuccess: 'Senarai berjaya dikemas kini',
      updateError: 'Gagal mengemas kini senarai',
      accessDenied: 'Akses Ditolak',
      accessDeniedDesc: 'Hanya penyedia perkhidmatan boleh mengakses papan pemuka penjual'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user && isServiceProvider) {
      fetchSellerData();
    }
  }, [user, isServiceProvider]);

  const fetchSellerData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch seller's items
      const { data: itemsData, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      const items = itemsData || [];
      setItems(items);

      // Calculate stats
      const totalViews = items.reduce((sum, item) => sum + (item.view_count || 0), 0);
      const totalSales = items.reduce((sum, item) => sum + (item.sold_count || 0), 0);
      const totalRevenue = items.reduce((sum, item) => sum + ((item.sold_count || 0) * item.price), 0);

      setStats({
        totalListings: items.length,
        activeListings: items.filter(item => item.is_active).length,
        totalSales,
        totalRevenue,
        totalViews
      });

    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch seller data' : 'Gagal mendapatkan data penjual',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ is_active: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.updateSuccess
      });

      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.deleteSuccess
      });

      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: t.deleteError,
        variant: 'destructive'
      });
    }
  };

  if (!isServiceProvider) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.accessDenied}</h3>
              <p className="text-muted-foreground">{t.accessDeniedDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
        <Button onClick={() => navigate('/marketplace')}>
          <Plus className="h-4 w-4 mr-2" />
          {t.createListing}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="listings">{t.myListings}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard 
              title={t.totalListings} 
              value={stats.totalListings} 
              icon={Package}
              color="text-blue-600"
            />
            <StatCard 
              title={t.activeListings} 
              value={stats.activeListings} 
              icon={ShoppingBag}
              color="text-green-600"
            />
            <StatCard 
              title={t.totalSales} 
              value={stats.totalSales} 
              icon={TrendingUp}
              color="text-purple-600"
            />
            <StatCard 
              title={t.totalRevenue} 
              value={`RM${stats.totalRevenue.toFixed(2)}`} 
              icon={DollarSign}
              color="text-emerald-600"
            />
            <StatCard 
              title={t.totalViews} 
              value={stats.totalViews} 
              icon={Eye}
              color="text-orange-600"
            />
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t.noListings}</h3>
                  <p className="text-muted-foreground mb-4">{t.noListingsDesc}</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createListing}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-4">
                            <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {item.is_active ? t.active : t.inactive}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t.price}:</span>
                              <p className="font-semibold text-primary">RM{item.price.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t.views}:</span>
                              <p className="font-semibold">{item.view_count || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t.sold}:</span>
                              <p className="font-semibold">{item.sold_count || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t.stock}:</span>
                              <p className="font-semibold">{item.stock_quantity || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/marketplace/item/${item.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleItemStatus(item.id, item.is_active)}
                            >
                              {item.is_active ? t.deactivate : t.activate}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}