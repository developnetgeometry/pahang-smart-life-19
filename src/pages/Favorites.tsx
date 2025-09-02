import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ShoppingBag, MapPin, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StarRating from '@/components/marketplace/StarRating';

interface FavoriteItem {
  id: string;
  created_at: string;
  marketplace_items: any; // Use any to avoid type conflicts with database schema
}

export default function Favorites() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const text = {
    en: {
      title: 'My Favorites',
      subtitle: 'Items you have saved for later',
      noFavorites: 'No favorite items yet',
      noFavoritesDesc: 'Start browsing the marketplace and add items to your favorites',
      browseMaketplace: 'Browse Marketplace',
      removeFromFavorites: 'Remove from Favorites',
      viewDetails: 'View Details',
      addedOn: 'Added on',
      price: 'Price',
      condition: 'Condition',
      location: 'Location',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair',
      removeSuccess: 'Removed from favorites',
      removeError: 'Failed to remove from favorites'
    },
    ms: {
      title: 'Kegemaran Saya',
      subtitle: 'Barang yang anda simpan untuk kemudian',
      noFavorites: 'Tiada barang kegemaran lagi',
      noFavoritesDesc: 'Mula melayari marketplace dan tambah barang ke kegemaran anda',
      browseMaketplace: 'Layari Marketplace',
      removeFromFavorites: 'Keluarkan dari Kegemaran',
      viewDetails: 'Lihat Butiran',
      addedOn: 'Ditambah pada',
      price: 'Harga',
      condition: 'Keadaan',
      location: 'Lokasi',
      new: 'Baru',
      likeNew: 'Seperti Baru',
      good: 'Baik',
      fair: 'Sederhana',
      removeSuccess: 'Dikeluarkan dari kegemaran',
      removeError: 'Gagal mengeluarkan dari kegemaran'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch favorites with explicit join
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select(`
          id,
          created_at,
          item_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch item details separately to avoid relation issues
      const itemIds = (data || []).map(fav => fav.item_id);
      if (itemIds.length === 0) {
        setFavorites([]);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('*')
        .in('id', itemIds);

      if (itemsError) throw itemsError;

      // Combine the data with proper type handling
      const combinedFavorites = (data || []).map(favorite => {
        const item = (itemsData || []).find(item => item.id === favorite.item_id);
        return {
          ...favorite,
          marketplace_items: item || null
        };
      }).filter(fav => fav.marketplace_items !== null) as FavoriteItem[];

      setFavorites(combinedFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch favorites' : 'Gagal mendapatkan kegemaran',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: t.removeSuccess
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: t.removeError,
        variant: 'destructive'
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like-new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new': return t.new;
      case 'like-new': return t.likeNew;
      case 'good': return t.good;
      case 'fair': return t.fair;
      default: return condition;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' ? 'Please log in to view your favorites' : 'Sila log masuk untuk melihat kegemaran anda'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
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

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noFavorites}</h3>
              <p className="text-muted-foreground mb-4">{t.noFavoritesDesc}</p>
              <Button onClick={() => navigate('/marketplace')}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t.browseMaketplace}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {favorites.map((favorite) => {
            const item = favorite.marketplace_items;
            return (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                          <Badge className={getConditionColor(item.condition)}>
                            {getConditionText(item.condition)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-primary">
                            RM{item.price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{t.addedOn} {new Date(favorite.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/marketplace/item/${item.id}`)}
                          >
                            {t.viewDetails}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(favorite.id)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}