import { useState } from 'react';
import { Share2, Users, Heart, Star, Copy, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Mock data until database migration is executed
const mockShares = [
  {
    id: '1',
    shared_by_name: 'Ahmad Rahman', 
    shared_by_avatar: null,
    shared_with: ['user1', 'user2'],
    message: 'Check out this amazing product!',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2', 
    shared_by_name: 'Siti Nurhaliza',
    shared_by_avatar: null,
    shared_with: ['user3'],
    message: 'Perfect for your home office!',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
];

const mockWishlists = [
  {
    id: '1',
    name: 'Home Essentials',
    description: 'Items for new apartment setup',
    item_count: 12,
    created_by_name: 'Hassan Ali',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Tech Gadgets 2024',
    description: 'Latest technology items I want to buy',
    item_count: 8,
    created_by_name: 'Mei Lin',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

const mockRecommendations = [
  {
    id: '1',
    product_title: 'Wireless Bluetooth Speaker',
    product_price: 129.99,
    product_image: null,
    recommended_by_name: 'David Tan',
    reason: 'Great sound quality for the price!',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

interface SocialFeaturesProps {
  productId?: string;
  productTitle?: string;
}

export default function SocialFeatures({ productId, productTitle }: SocialFeaturesProps) {
  const { toast } = useToast();
  const [loading] = useState(false);

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

  const handleShare = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Product sharing will be available after database migration",
    });
  };

  const handleRecommend = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "Product recommendations will be available after database migration",
    });
  };

  const handleCreateWishlist = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Wishlist creation will be available after database migration",
    });
  };

  if (loading) {
    return <div>Loading social features...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Social Features</h2>
        <Badge variant="outline" className="text-yellow-600">
          Mock Data - Migration Pending
        </Badge>
      </div>

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
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Product
              </Button>

              <Button variant="outline" size="sm" onClick={handleRecommend}>
                <Star className="h-4 w-4 mr-2" />
                Recommend
              </Button>

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
            {mockShares.length > 0 ? (
              mockShares.map((share) => (
                <div key={share.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {share.shared_by_name?.[0]}
                    </span>
                  </div>
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
          <Button size="sm" onClick={handleCreateWishlist}>
            <Users className="h-4 w-4 mr-2" />
            Create Wishlist
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockWishlists.length > 0 ? (
              mockWishlists.map((wishlist) => (
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
            {mockRecommendations.length > 0 ? (
              mockRecommendations.map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs">IMG</span>
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

      <div className="text-center text-sm text-muted-foreground mt-6 p-4 bg-muted rounded-lg">
        ⚠️ This is displaying mock data. Full social features will be available after the database migration is executed.
      </div>
    </div>
  );
}