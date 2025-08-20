import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Plus, Search, Heart, MessageCircle, Star, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  seller: string;
  sellerRating: number;
  location: string;
  postedDate: string;
  images: string[];
  isFavorite: boolean;
}

export default function Marketplace() {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const mockItems: MarketplaceItem[] = [
    {
      id: '1',
      title: 'iPhone 13 Pro Max',
      description: 'Keadaan sangat baik, disertakan dengan kotak asal dan pengecas',
      price: 3500,
      category: 'electronics',
      condition: 'like-new',
      seller: 'Ahmad Ali',
      sellerRating: 4.8,
      location: 'Blok A, Unit 15-2',
      postedDate: '2024-01-15',
      images: ['/phone.jpg'],
      isFavorite: false
    },
    {
      id: '2',
      title: 'Set Meja Makan IKEA',
      description: 'Meja makan 6 tempat duduk dengan kerusi, keadaan baik',
      price: 800,
      category: 'furniture',
      condition: 'good',
      seller: 'Siti Sarah',
      sellerRating: 4.5,
      location: 'Blok B, Unit 8-1',
      postedDate: '2024-01-12',
      images: ['/table.jpg'],
      isFavorite: true
    },
    {
      id: '3',
      title: 'Koleksi Buku Pengaturcaraan',
      description: 'Pelbagai buku pengaturcaraan, sesuai untuk pelajar',
      price: 150,
      category: 'books',
      condition: 'good',
      seller: 'Muhammad Wong',
      sellerRating: 4.9,
      location: 'Blok C, Unit 12-5',
      postedDate: '2024-01-10',
      images: ['/books.jpg'],
      isFavorite: false
    }
  ];

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'electronics', label: 'Elektronik' },
    { value: 'furniture', label: 'Perabot' },
    { value: 'clothing', label: 'Pakaian' },
    { value: 'books', label: 'Buku' },
    { value: 'sports', label: 'Sukan & Rekreasi' },
    { value: 'others', label: 'Lain-lain' }
  ];

  const conditions = [
    { value: 'all', label: 'Semua Keadaan' },
    { value: 'new', label: 'Baru' },
    { value: 'like-new', label: 'Seperti Baru' },
    { value: 'good', label: 'Baik' },
    { value: 'fair', label: 'Sederhana' }
  ];

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
      case 'new': return 'Baru';
      case 'like-new': return 'Seperti Baru';
      case 'good': return 'Baik';
      case 'fair': return 'Sederhana';
      default: return condition;
    }
  };

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleCreateListing = () => {
    toast({
      title: 'Senarai berjaya dicipta!',
    });
    setIsCreateOpen(false);
  };

  const handleContactSeller = () => {
    toast({
      title: 'Permintaan hubungan dihantar!',
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pasar Komuniti</h1>
          <p className="text-muted-foreground">Beli dan jual barang dalam komuniti anda</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Senarai Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Cipta Senarai Baru</DialogTitle>
              <DialogDescription>Jual barang anda kepada komuniti</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tajuk Barang</Label>
                <Input id="title" placeholder="Tajuk Barang" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Keadaan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Keadaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.slice(1).map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga (RM)</Label>
                <Input id="price" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Penerangan</Label>
                <Textarea 
                  id="description" 
                  placeholder="Penerangan"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Gambar Barang</Label>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Maklumat Hubungan</Label>
                <Input id="contact" placeholder="Nombor telefon atau emel" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateListing}>
                  Cipta Senarai
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                  </CardDescription>
                </div>
                <Badge className={getConditionColor(item.condition)}>
                  {getConditionText(item.condition)}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-primary">
                  RM{item.price.toLocaleString()}
                </span>
                <Button variant="ghost" size="sm">
                  <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {item.seller.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.seller}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{item.sellerRating}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Disiarkan pada {item.postedDate}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleContactSeller}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Hubungi Penjual
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Tiada barang dijumpai
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}