import { useState, useEffect } from 'react';
import { Share2, Users, Heart, MessageCircle, Copy, Link, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProductShare {
  id: string;
  product_id: string;
  shared_by: string;
  shared_with: string[];
  message?: string;
  created_at: string;
  shared_by_name?: string;
  shared_by_avatar?: string;
}

interface SharedWishlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  item_count?: number;
  created_by_name?: string;
}

interface ProductRecommendation {
  id: string;
  recommended_product_id: string;
  recommended_to: string;
  recommended_by: string;
  reason?: string;
  created_at: string;
  product_title?: string;
  product_price?: number;
  product_image?: string;
  recommended_by_name?: string;
}

interface SocialFeaturesProps {
  productId?: string;
  productTitle?: string;
}

export default function SocialFeatures({ productId, productTitle }: SocialFeaturesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shares, setShares] = useState<ProductShare[]>([]);
  const [wishlists, setWishlists] = useState<SharedWishlist[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
  const [isRecommendDialogOpen, setIsRecommendDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user, productId]);

  const fetchSocialData = async () => {
    try {
      const [sharesRes, wishlistsRes, recommendationsRes] = await Promise.all([
        supabase
          .from('product_shares')
          .select(`
            *,
            profiles!inner(display_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(10),
        
        supabase
          .from('shared_wishlists')
          .select(`
            *,
            profiles!inner(display_name)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(10),
        
        supabase
          .from('product_recommendations')
          .select(`
            *,
            marketplace_items!inner(title, price, image_url),
            profiles!inner(display_name)
          `)
          .eq('recommended_to', user?.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (sharesRes.data) {
        const processedShares = sharesRes.data.map(share => ({
          ...share,
          shared_by_name: share.profiles?.display_name || 'Anonymous',
          shared_by_avatar: share.profiles?.avatar_url
        }));
        setShares(processedShares);
      }

      if (wishlistsRes.data) {
        const processedWishlists = wishlistsRes.data.map(wishlist => ({
          ...wishlist,
          created_by_name: wishlist.profiles?.display_name || 'Anonymous'
        }));
        setWishlists(processedWishlists);
      }

      if (recommendationsRes.data) {
        const processedRecommendations = recommendationsRes.data.map(rec => ({
          ...rec,
          product_title: rec.marketplace_items?.title,
          product_price: rec.marketplace_items?.price,
          product_image: rec.marketplace_items?.image_url,
          recommended_by_name: rec.profiles?.display_name || 'Anonymous'
        }));
        setRecommendations(processedRecommendations);
      }

    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProduct = async (message: string, shareWithEmails: string[]) => {
    if (!user || !productId) return;

    try {
      // Get user IDs from emails
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id')
        .in('email', shareWithEmails);

      if (usersError) throw usersError;

      const userIds = users?.map(u => u.user_id) || [];

      const { error } = await supabase
        .from('product_shares')
        .insert({
          product_id: productId,
          shared_by: user.id,
          shared_with: userIds,
          message: message
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product shared successfully!",
      });

      setIsShareDialogOpen(false);
      fetchSocialData();
    } catch (error) {
      console.error('Error sharing product:', error);
      toast({
        title: "Error",
        description: "Failed to share product",
        variant: "destructive",
      });
    }
  };

  const handleCreateSharedWishlist = async (name: string, description: string, isPublic: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shared_wishlists')
        .insert({
          name,
          description,
          is_public: isPublic,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Wishlist created successfully!",
      });

      setIsWishlistDialogOpen(false);
      fetchSocialData();
    } catch (error) {
      console.error('Error creating wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to create wishlist",
        variant: "destructive",
      });
    }
  };

  const handleRecommendProduct = async (recommendToEmail: string, reason: string) => {
    if (!user || !productId) return;

    try {
      // Get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', recommendToEmail)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('product_recommendations')
        .insert({
          recommended_product_id: productId,
          recommended_to: userData.user_id,
          recommended_by: user.id,
          reason
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product recommended successfully!",
      });

      setIsRecommendDialogOpen(false);
    } catch (error) {
      console.error('Error recommending product:', error);
      toast({
        title: "Error",
        description: "Failed to recommend product",
        variant: "destructive",
      });
    }
  };

  const copyProductLink = () => {
    if (productId) {
      const link = `${window.location.origin}/marketplace/${productId}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  if (loading) {
    return <div>Loading social features...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {productId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share & Recommend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Product</DialogTitle>
                  </DialogHeader>
                  <ShareProductForm
                    productTitle={productTitle || ''}
                    onShare={handleShareProduct}
                    onCancel={() => setIsShareDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isRecommendDialogOpen} onOpenChange={setIsRecommendDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Recommend
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Recommend Product</DialogTitle>
                  </DialogHeader>
                  <RecommendProductForm
                    onRecommend={handleRecommendProduct}
                    onCancel={() => setIsRecommendDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={copyProductLink}>
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Product Shares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Recent Shares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shares.length > 0 ? (
              shares.map((share) => (
                <div key={share.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={share.shared_by_avatar} />
                    <AvatarFallback>{share.shared_by_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{share.shared_by_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Shared with {share.shared_with.length} people
                    </p>
                    {share.message && (
                      <p className="text-sm mt-1 italic">"{share.message}"</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(share.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent shares</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Public Wishlists */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Public Wishlists
          </CardTitle>
          <Dialog open={isWishlistDialogOpen} onOpenChange={setIsWishlistDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Create Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Shared Wishlist</DialogTitle>
              </DialogHeader>
              <CreateWishlistForm
                onCreate={handleCreateSharedWishlist}
                onCancel={() => setIsWishlistDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlists.length > 0 ? (
              wishlists.map((wishlist) => (
                <div key={wishlist.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{wishlist.name}</h4>
                    <Badge variant="secondary">{wishlist.item_count || 0} items</Badge>
                  </div>
                  {wishlist.description && (
                    <p className="text-sm text-muted-foreground mb-2">{wishlist.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    By {wishlist.created_by_name} • {new Date(wishlist.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4 col-span-full">No public wishlists</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recommendations for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded flex-shrink-0">
                    {rec.product_image ? (
                      <img src={rec.product_image} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{rec.product_title}</h4>
                    <p className="text-sm text-primary font-medium">
                      RM{rec.product_price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended by {rec.recommended_by_name}
                    </p>
                    {rec.reason && (
                      <p className="text-xs mt-1 italic">"{rec.reason}"</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recommendations yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Share Product Form
function ShareProductForm({ 
  productTitle, 
  onShare, 
  onCancel 
}: { 
  productTitle: string; 
  onShare: (message: string, emails: string[]) => void; 
  onCancel: () => void; 
}) {
  const [message, setMessage] = useState('');
  const [emails, setEmails] = useState('');

  const handleSubmit = () => {
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
    onShare(message, emailList);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product: {productTitle}</Label>
      </div>
      
      <div>
        <Label htmlFor="emails">Share with (email addresses, comma-separated)</Label>
        <Input
          id="emails"
          placeholder="friend@example.com, another@example.com"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          placeholder="Check out this product!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={!emails.trim()}>Share</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// Create Wishlist Form
function CreateWishlistForm({ 
  onCreate, 
  onCancel 
}: { 
  onCreate: (name: string, description: string, isPublic: boolean) => void; 
  onCancel: () => void; 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Wishlist Name</Label>
        <Input
          id="name"
          placeholder="My Wishlist"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="A collection of items I want..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <Label htmlFor="isPublic">Make this wishlist public</Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onCreate(name, description, isPublic)} disabled={!name.trim()}>
          Create
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// Recommend Product Form
function RecommendProductForm({ 
  onRecommend, 
  onCancel 
}: { 
  onRecommend: (email: string, reason: string) => void; 
  onCancel: () => void; 
}) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Recommend to (email address)</Label>
        <Input
          id="email"
          type="email"
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="reason">Reason (optional)</Label>
        <Textarea
          id="reason"
          placeholder="I think you'd like this because..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onRecommend(email, reason)} disabled={!email.trim()}>
          Recommend
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}