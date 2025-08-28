import { useState } from 'react';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShoppingCartProps {
  language: 'en' | 'ms';
}

export default function ShoppingCart({ language }: ShoppingCartProps) {
  const { user } = useAuth();
  const { cartItems, loading, totalAmount, updateQuantity, removeFromCart, clearCart } = useShoppingCart();
  const { toast } = useToast();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const text = {
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      total: 'Total',
      clearCart: 'Clear Cart',
      checkout: 'Proceed to Checkout',
      remove: 'Remove',
      quantity: 'Quantity',
      outOfStock: 'Out of Stock',
      processing: 'Processing...'
    },
    ms: {
      title: 'Troli Belanja',
      empty: 'Troli anda kosong',
      total: 'Jumlah',
      clearCart: 'Kosongkan Troli',
      checkout: 'Teruskan ke Pembayaran',
      remove: 'Buang',
      quantity: 'Kuantiti',
      outOfStock: 'Kehabisan Stok',
      processing: 'Memproses...'
    }
  };

  const t = text[language];

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Authentication Required' : 'Pengesahan Diperlukan',
        description: language === 'en' ? 'Please login to proceed' : 'Sila log masuk untuk meneruskan',
        variant: 'destructive'
      });
      return;
    }

    if (cartItems.length === 0) return;

    setProcessingCheckout(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          currency: 'MYR',
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.marketplace_items.price,
        total_price: item.marketplace_items.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create Stripe checkout session
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          orderId: order.id,
          businessName: 'Community Marketplace',
          title: `Order #${order.id.slice(0, 8)}`,
          price: Math.round(totalAmount * 100), // Convert to cents
          items: cartItems.map(item => ({
            name: item.marketplace_items.title,
            quantity: item.quantity,
            price: item.marketplace_items.price
          }))
        }
      });

      if (stripeError) throw stripeError;

      if (stripeData?.url) {
        // Update order with Stripe session ID
        await supabase
          .from('orders')
          .update({ stripe_session_id: stripeData.sessionId })
          .eq('id', order.id);

        // Open Stripe checkout
        window.open(stripeData.url, '_blank');
        
        toast({
          title: language === 'en' ? 'Redirecting to Payment' : 'Mengalihkan ke Pembayaran',
          description: language === 'en' ? 'Opening payment page...' : 'Membuka halaman pembayaran...'
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: language === 'en' ? 'Checkout Failed' : 'Pembayaran Gagal',
        description: language === 'en' ? 'Please try again' : 'Sila cuba lagi',
        variant: 'destructive'
      });
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t.empty}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          {t.title}
          <Badge variant="secondary">{cartItems.length}</Badge>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          {t.clearCart}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
            {item.marketplace_items.image && (
              <img
                src={item.marketplace_items.image}
                alt={item.marketplace_items.title}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium">{item.marketplace_items.title}</h4>
              <p className="text-sm text-muted-foreground">
                RM {item.marketplace_items.price.toFixed(2)} each
              </p>
              {!item.marketplace_items.is_in_stock && (
                <Badge variant="destructive" className="mt-1">
                  {t.outOfStock}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={!item.marketplace_items.is_in_stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <p className="font-medium">
                RM {(item.marketplace_items.price * item.quantity).toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t.remove}
              </Button>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>{t.total}:</span>
          <span>RM {totalAmount.toFixed(2)}</span>
        </div>
        
        <Button 
          onClick={handleCheckout}
          disabled={processingCheckout || cartItems.some(item => !item.marketplace_items.is_in_stock)}
          className="w-full"
          size="lg"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {processingCheckout ? t.processing : t.checkout}
        </Button>
      </CardContent>
    </Card>
  );
}