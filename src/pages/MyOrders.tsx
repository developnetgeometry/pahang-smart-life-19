import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketplaceOrder {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  quantity: number;
  total_amount: number;
  status: string; // Changed from union type to string
  payment_status: string; // Changed from union type to string
  order_date: string;
  shipped_date?: string;
  delivered_date?: string;
  notes?: string;
  // Joined data
  item_title?: string;
  item_image?: string;
  seller_name?: string;
  buyer_name?: string;
}

export default function MyOrders() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [buyerOrders, setBuyerOrders] = useState<MarketplaceOrder[]>([]);
  const [sellerOrders, setSellerOrders] = useState<MarketplaceOrder[]>([]);
  
  const isServiceProvider = hasRole('service_provider');

  const text = {
    en: {
      title: 'My Orders',
      subtitle: 'Track your marketplace purchases and sales',
      myPurchases: 'My Purchases',
      mySales: 'My Sales',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      status: 'Status',
      paymentStatus: 'Payment',
      total: 'Total',
      quantity: 'Qty',
      seller: 'Seller',
      buyer: 'Buyer',
      item: 'Item',
      updateStatus: 'Update Status',
      confirmOrder: 'Confirm Order',
      markShipped: 'Mark as Shipped',
      markDelivered: 'Mark as Delivered',
      cancelOrder: 'Cancel Order',
      noOrders: 'No orders found',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      paid: 'Paid',
      unpaid: 'Unpaid',
      updateSuccess: 'Order status updated successfully',
      updateError: 'Failed to update order status'
    },
    ms: {
      title: 'Pesanan Saya',
      subtitle: 'Jejaki pembelian dan jualan marketplace anda',
      myPurchases: 'Pembelian Saya',
      mySales: 'Jualan Saya',
      orderNumber: 'Pesanan #',
      orderDate: 'Tarikh Pesanan',
      status: 'Status',
      paymentStatus: 'Pembayaran',
      total: 'Jumlah',
      quantity: 'Kuantiti',
      seller: 'Penjual',
      buyer: 'Pembeli',
      item: 'Barang',
      updateStatus: 'Kemas Kini Status',
      confirmOrder: 'Sahkan Pesanan',
      markShipped: 'Tandakan Dihantar',
      markDelivered: 'Tandakan Diterima',
      cancelOrder: 'Batal Pesanan',
      noOrders: 'Tiada pesanan dijumpai',
      pending: 'Menunggu',
      confirmed: 'Disahkan',
      shipped: 'Dihantar',
      delivered: 'Diterima',
      cancelled: 'Dibatalkan',
      refunded: 'Dikembalikan',
      paid: 'Dibayar',
      unpaid: 'Belum Bayar',
      updateSuccess: 'Status pesanan berjaya dikemas kini',
      updateError: 'Gagal mengemas kini status pesanan'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch buyer orders
      const { data: buyerOrdersData, error: buyerError } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('order_date', { ascending: false });

      if (buyerError) throw buyerError;

      // Fetch seller orders if user is a service provider
      let sellerOrdersData = [];
      if (isServiceProvider) {
        const { data, error: sellerError } = await supabase
          .from('marketplace_orders')
          .select('*')
          .eq('seller_id', user.id)
          .order('order_date', { ascending: false });

        if (sellerError) throw sellerError;
        sellerOrdersData = data || [];
      }

      setBuyerOrders((buyerOrdersData as MarketplaceOrder[]) || []);
      setSellerOrders((sellerOrdersData as MarketplaceOrder[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch orders' : 'Gagal mendapatkan pesanan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'shipped') {
        updateData.shipped_date = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('marketplace_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: t.updateSuccess
      });

      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ShoppingBag },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {t[status] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    return (
      <Badge className={paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {t[paymentStatus] || paymentStatus}
      </Badge>
    );
  };

  const renderOrderCard = (order: MarketplaceOrder, isSeller = false) => (
    <Card key={order.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {t.orderNumber}{order.id.slice(-8)}
            </CardTitle>
            <CardDescription>
              {new Date(order.order_date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(order.status)}
            {getPaymentStatusBadge(order.payment_status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Order Item</h4>
            <p className="text-sm text-muted-foreground">
              {t.quantity}: {order.quantity}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">RM{order.total_amount.toFixed(2)}</p>
          </div>
        </div>

        {isSeller && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="flex gap-2 pt-2 border-t">
            {order.status === 'pending' && (
              <Button 
                size="sm" 
                onClick={() => updateOrderStatus(order.id, 'confirmed')}
              >
                {t.confirmOrder}
              </Button>
            )}
            {order.status === 'confirmed' && (
              <Button 
                size="sm" 
                onClick={() => updateOrderStatus(order.id, 'shipped')}
              >
                {t.markShipped}
              </Button>
            )}
            {order.status === 'shipped' && (
              <Button 
                size="sm" 
                onClick={() => updateOrderStatus(order.id, 'delivered')}
              >
                {t.markDelivered}
              </Button>
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                {t.cancelOrder}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/6" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="purchases">{t.myPurchases}</TabsTrigger>
          {isServiceProvider && (
            <TabsTrigger value="sales">{t.mySales}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          {buyerOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.noOrders}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            buyerOrders.map(order => renderOrderCard(order, false))
          )}
        </TabsContent>

        {isServiceProvider && (
          <TabsContent value="sales" className="space-y-4">
            {sellerOrders.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.noOrders}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sellerOrders.map(order => renderOrderCard(order, true))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}