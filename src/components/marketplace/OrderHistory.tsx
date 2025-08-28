import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Calendar, CreditCard, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    marketplace_items: {
      id: string;
      title: string;
      image?: string;
    };
  }[];
}

interface OrderHistoryProps {
  language: 'en' | 'ms';
}

export default function OrderHistory({ language }: OrderHistoryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const text = {
    en: {
      title: 'Order History',
      empty: 'No orders found',
      orderDetails: 'Order Details',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      total: 'Total',
      status: 'Status',
      paymentStatus: 'Payment Status',
      items: 'Items',
      quantity: 'Qty',
      price: 'Price',
      viewDetails: 'View Details',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded'
    },
    ms: {
      title: 'Sejarah Pesanan',
      empty: 'Tiada pesanan dijumpai',
      orderDetails: 'Butiran Pesanan',
      orderNumber: 'Pesanan #',
      orderDate: 'Tarikh Pesanan',
      total: 'Jumlah',
      status: 'Status',
      paymentStatus: 'Status Pembayaran',
      items: 'Barang',
      quantity: 'Kuantiti',
      price: 'Harga',
      viewDetails: 'Lihat Butiran',
      pending: 'Menunggu',
      processing: 'Memproses',
      shipped: 'Dihantar',
      delivered: 'Sampai',
      cancelled: 'Dibatalkan',
      paid: 'Dibayar',
      failed: 'Gagal',
      refunded: 'Dikembalikan'
    }
  };

  const t = text[language];

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            marketplace_items (
              id,
              title,
              image
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to load orders' : 'Gagal memuatkan pesanan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return t[status as keyof typeof t] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t.empty}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">
                  {t.orderNumber}{order.id.slice(0, 8)}
                </h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{order.currency} {order.total_amount.toFixed(2)}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {getStatusText(order.payment_status)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {order.order_items.length} {t.items}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t.viewDetails}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {t.orderDetails} - {t.orderNumber}{order.id.slice(0, 8)}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">{t.orderDate}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.total}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.currency} {order.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.status}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.paymentStatus}</p>
                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                          {getStatusText(order.payment_status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-3">{t.items}</h4>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                            {item.marketplace_items.image && (
                              <img
                                src={item.marketplace_items.image}
                                alt={item.marketplace_items.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{item.marketplace_items.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {t.quantity}: {item.quantity} × {order.currency} {item.unit_price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium">
                              {order.currency} {item.total_price.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}