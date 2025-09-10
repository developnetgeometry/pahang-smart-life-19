import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  EyeOff,
  Package,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SmartImage } from '@/components/ui/dynamic-image';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image: string;
  view_count: number;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  seller_type: 'resident' | 'service_provider';
}

export default function MyListings() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketplaceItem[]>([]);

  const text = {
    en: {
      title: 'My Listings',
      subtitle: 'Manage your marketplace items',
      activeListings: 'Active Listings',
      inactiveListings: 'Inactive Listings',
      createListing: 'Create New Listing',
      noListings: 'No listings yet',
      noListingsDesc: 'Create your first listing to start selling',
      noActiveListings: 'No active listings',
      noInactiveListings: 'No inactive listings',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      sold: 'Sold',
      available: 'Available',
      views: 'Views',
      price: 'Price',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      activate: 'Activate',
      deactivate: 'Deactivate',
      markSold: 'Mark as Sold',
      markAvailable: 'Mark as Available',
      deleteConfirm: 'Are you sure you want to delete this listing?',
      deleteSuccess: 'Listing deleted successfully',
      deleteError: 'Failed to delete listing',
      updateSuccess: 'Listing updated successfully',
      updateError: 'Failed to update listing'
    },
    ms: {
      title: 'Senarai Saya',
      subtitle: 'Urus item marketplace anda',
      activeListings: 'Senarai Aktif',
      inactiveListings: 'Senarai Tidak Aktif',
      createListing: 'Cipta Senarai Baru',
      noListings: 'Belum ada senarai',
      noListingsDesc: 'Cipta senarai pertama anda untuk mula menjual',
      noActiveListings: 'Tiada senarai aktif',
      noInactiveListings: 'Tiada senarai tidak aktif',
      status: 'Status',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      sold: 'Dijual',
      available: 'Tersedia',
      views: 'Paparan',
      price: 'Harga',
      actions: 'Tindakan',
      edit: 'Edit',
      delete: 'Padam',
      view: 'Lihat',
      activate: 'Aktifkan',
      deactivate: 'Nyahaktifkan',
      markSold: 'Tandai sebagai Dijual',
      markAvailable: 'Tandai sebagai Tersedia',
      deleteConfirm: 'Adakah anda pasti mahu memadamkan senarai ini?',
      deleteSuccess: 'Senarai berjaya dipadamkan',
      deleteError: 'Gagal memadamkan senarai',
      updateSuccess: 'Senarai berjaya dikemas kini',
      updateError: 'Gagal mengemas kini senarai'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const fetchMyListings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems((data || []) as MarketplaceItem[]);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch listings' : 'Gagal mendapatkan senarai',
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

      fetchMyListings(); // Refresh data
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

  const toggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ is_available: !currentAvailability })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.updateSuccess
      });

      fetchMyListings(); // Refresh data
    } catch (error) {
      console.error('Error updating item availability:', error);
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

      fetchMyListings(); // Refresh data
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: t.deleteError,
        variant: 'destructive'
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'like-new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'good': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'fair': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const activeItems = items.filter(item => item.is_active);
  const inactiveItems = items.filter(item => !item.is_active);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-40 bg-muted animate-pulse rounded mb-4" />
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ItemCard = ({ item }: { item: MarketplaceItem }) => (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {item.image && (
            <SmartImage
              src={item.image}
              alt={item.title}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold line-clamp-2">{item.title}</h3>
              <Badge className={getConditionColor(item.condition)}>
                {item.condition}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                RM{item.price.toFixed(2)}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{item.view_count || 0} {t.views}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={item.is_available ? "default" : "secondary"}>
                {item.is_available ? t.available : t.sold}
              </Badge>
              <Badge variant={item.is_active ? "default" : "outline"}>
                {item.is_active ? t.active : t.inactive}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/marketplace/item/${item.id}`)}
            >
              <Eye className="h-3 w-3 mr-1" />
              {t.view}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleItemStatus(item.id, item.is_active)}
            >
              {item.is_active ? (
                <><EyeOff className="h-3 w-3 mr-1" /> {t.deactivate}</>
              ) : (
                <><Eye className="h-3 w-3 mr-1" /> {t.activate}</>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAvailability(item.id, item.is_available)}
            >
              <Package className="h-3 w-3 mr-1" />
              {item.is_available ? t.markSold : t.markAvailable}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {t.delete}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
        <Button onClick={() => navigate('/marketplace')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t.createListing}
        </Button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noListings}</h3>
              <p className="text-muted-foreground mb-6">{t.noListingsDesc}</p>
              <Button onClick={() => navigate('/marketplace')}>
                <Plus className="h-4 w-4 mr-2" />
                {t.createListing}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Listings Tabs */
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              {t.activeListings} ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              {t.inactiveListings} ({inactiveItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeItems.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t.noActiveListings}</h3>
                    <Button onClick={() => navigate('/marketplace')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t.createListing}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-6">
            {inactiveItems.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t.noInactiveListings}</h3>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}