import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type CartItem = Database['public']['Tables']['shopping_cart']['Row'] & {
  marketplace_items: {
    id: string;
    title: string;
    price: number;
    image?: string;
    stock_quantity: number;
    is_in_stock: boolean;
    seller_id: string;
  };
};

export const useShoppingCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          marketplace_items (
            id,
            title,
            price,
            image,
            stock_quantity,
            is_in_stock,
            seller_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data as CartItem[]);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (itemId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to add items to cart',
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.item_id === itemId);
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await supabase
          .from('shopping_cart')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('shopping_cart')
          .insert({
            user_id: user.id,
            item_id: itemId,
            quantity
          });

        if (error) throw error;
      }

      await fetchCartItems();
      toast({
        title: 'Added to Cart',
        description: 'Item has been added to your cart'
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const { error } = await supabase
        .from('shopping_cart')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive'
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCartItems();
      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive'
      });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive'
      });
    }
  };

  // Calculate total amount
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.marketplace_items.price * item.quantity);
    }, 0);
    setTotalAmount(total);
  }, [cartItems]);

  // Fetch cart items when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setTotalAmount(0);
    }
  }, [user]);

  return {
    cartItems,
    loading,
    totalAmount,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCartItems
  };
};