import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FavoriteButtonProps {
  itemId: string;
  language: 'en' | 'ms';
}

export default function FavoriteButton({ itemId, language }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, itemId]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Login Required' : 'Log Masuk Diperlukan',
        description: language === 'en' ? 'Please log in to add favorites' : 'Sila log masuk untuk menambah kegemaran',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: language === 'en' ? 'Removed from Favorites' : 'Dikeluarkan dari Kegemaran'
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('marketplace_favorites')
          .insert({
            user_id: user.id,
            item_id: itemId
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: language === 'en' ? 'Added to Favorites' : 'Ditambah ke Kegemaran'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to update favorites' : 'Gagal mengemas kini kegemaran',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className="p-2"
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
      />
    </Button>
  );
}