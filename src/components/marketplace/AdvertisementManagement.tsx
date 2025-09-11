import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, DollarSign, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  business_name: string;
  contact_phone: string;
  contact_email: string;
  website_url: string;
  category: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  start_date: string;
  end_date: string;
  click_count: number;
  created_at: string;
  // New e-commerce fields
  price?: number;
  currency?: string;
  product_type?: 'service' | 'product' | 'both';
  is_in_stock?: boolean;
  stock_quantity?: number;
  low_stock_alert?: number;
  shipping_required?: boolean;
  shipping_cost?: number;
  product_weight?: number;
  condition_status?: string;
  product_dimensions?: string;
  warranty_period?: string;
  return_policy?: string;
  service_areas?: string[];
}

interface AdvertisementManagementProps {
  language: 'en' | 'ms';
}

export default function AdvertisementManagement({ language }: AdvertisementManagementProps) {
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const isServiceProvider = hasRole('service_provider');

  const getDefaultFormData = () => ({
    title: '',
    description: '',
    business_name: '',
    contact_phone: '',
    contact_email: '',
    website_url: '',
    category: '',
    tags: '',
    image_url: '',
    is_featured: false,
    start_date: '',
    end_date: '',
    // New e-commerce fields
    price: '',
    currency: 'MYR',
    product_type: 'service' as 'service' | 'product' | 'both',
    is_in_stock: true,
    stock_quantity: '',
    low_stock_alert: '5',
    shipping_required: false,
    shipping_cost: '',
    product_weight: '',
    condition_status: 'new',
    product_dimensions: '',
    warranty_period: '',
    return_policy: '',
    service_areas: '',
    target_my_district: false,
    target_my_community: false
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  const text = {
    en: {
      title: 'Advertisement Management',
      subtitle: 'Manage your business advertisements',
      newAd: 'New Advertisement',
      createTitle: 'Create New Advertisement',
      createSubtitle: 'Promote your business to the community',
      editTitle: 'Edit Advertisement',
      businessName: 'Business Name',
      adTitle: 'Advertisement Title',
      description: 'Description',
      category: 'Category',
      contactPhone: 'Contact Phone',
      contactEmail: 'Contact Email',
      website: 'Website URL',
      imageUrl: 'Image URL',
      tags: 'Tags (comma separated)',
      featured: 'Featured Advertisement',
      startDate: 'Start Date',
      endDate: 'End Date',
      active: 'Active',
      clicks: 'Clicks',
      create: 'Create Advertisement',
      update: 'Update Advertisement',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      toggle: 'Toggle Status',
      selectCategory: 'Select Category',
      services: 'Services',
      retail: 'Retail',
      food: 'Food & Beverage',
      health: 'Health & Wellness',
      education: 'Education',
      technology: 'Technology',
      others: 'Others',
      createSuccess: 'Advertisement created successfully!',
      updateSuccess: 'Advertisement updated successfully!',
      deleteSuccess: 'Advertisement deleted successfully!',
      accessDenied: 'Only service providers can manage advertisements',
      // New fields
      generalInfo: 'General Information',
      pricingInventory: 'Pricing & Inventory',
      shipping: 'Shipping Information',
      specifications: 'Specifications',
      policies: 'Policies & Warranty',
      targeting: 'Service Areas',
      productType: 'Type',
      price: 'Price',
      currency: 'Currency',
      inStock: 'In Stock',
      stockQuantity: 'Stock Quantity',
      lowStockAlert: 'Low Stock Alert',
      shippingRequired: 'Shipping Required',
      shippingCost: 'Shipping Cost',
      productWeight: 'Product Weight (kg)',
      conditionStatus: 'Condition',
      productDimensions: 'Product Dimensions',
      warrantyPeriod: 'Warranty Period',
      returnPolicy: 'Return Policy',
      targetMyDistrict: 'Target My District',
      targetMyCommunity: 'Target My Community',
      additionalAreas: 'Additional Area IDs',
      serviceType: 'Service',
      productSale: 'Product',
      bothTypes: 'Both Service & Product',
      conditionNew: 'New',
      conditionUsed: 'Used',
      conditionRefurbished: 'Refurbished'
    },
    ms: {
      title: 'Pengurusan Iklan',
      subtitle: 'Urus iklan perniagaan anda',
      newAd: 'Iklan Baru',
      createTitle: 'Cipta Iklan Baru',
      createSubtitle: 'Promosikan perniagaan anda kepada komuniti',
      editTitle: 'Edit Iklan',
      businessName: 'Nama Perniagaan',
      adTitle: 'Tajuk Iklan',
      description: 'Penerangan',
      category: 'Kategori',
      contactPhone: 'Telefon Hubungan',
      contactEmail: 'Email Hubungan',
      website: 'URL Laman Web',
      imageUrl: 'URL Gambar',
      tags: 'Tag (dipisahkan koma)',
      featured: 'Iklan Pilihan',
      startDate: 'Tarikh Mula',
      endDate: 'Tarikh Tamat',
      active: 'Aktif',
      clicks: 'Klik',
      create: 'Cipta Iklan',
      update: 'Kemaskini Iklan',
      cancel: 'Batal',
      edit: 'Edit',
      delete: 'Padam',
      toggle: 'Toggle Status',
      selectCategory: 'Pilih Kategori',
      services: 'Perkhidmatan',
      retail: 'Runcit',
      food: 'Makanan & Minuman',
      health: 'Kesihatan & Kecergasan',
      education: 'Pendidikan',
      technology: 'Teknologi',
      others: 'Lain-lain',
      createSuccess: 'Iklan berjaya dicipta!',
      updateSuccess: 'Iklan berjaya dikemaskini!',
      deleteSuccess: 'Iklan berjaya dipadam!',
      accessDenied: 'Hanya penyedia perkhidmatan boleh menguruskan iklan',
      // New fields
      generalInfo: 'Maklumat Am',
      pricingInventory: 'Harga & Inventori',
      shipping: 'Maklumat Penghantaran',
      specifications: 'Spesifikasi',
      policies: 'Polisi & Waranti',
      targeting: 'Kawasan Perkhidmatan',
      productType: 'Jenis',
      price: 'Harga',
      currency: 'Mata Wang',
      inStock: 'Dalam Stok',
      stockQuantity: 'Kuantiti Stok',
      lowStockAlert: 'Amaran Stok Rendah',
      shippingRequired: 'Penghantaran Diperlukan',
      shippingCost: 'Kos Penghantaran',
      productWeight: 'Berat Produk (kg)',
      conditionStatus: 'Keadaan',
      productDimensions: 'Dimensi Produk',
      warrantyPeriod: 'Tempoh Waranti',
      returnPolicy: 'Polisi Pemulangan',
      targetMyDistrict: 'Sasarkan Daerah Saya',
      targetMyCommunity: 'Sasarkan Komuniti Saya',
      additionalAreas: 'ID Kawasan Tambahan',
      serviceType: 'Perkhidmatan',
      productSale: 'Produk',
      bothTypes: 'Perkhidmatan & Produk',
      conditionNew: 'Baru',
      conditionUsed: 'Terpakai',
      conditionRefurbished: 'Diperbaharui'
    }
  };

  const t = text[language];

  const categories = [
    { value: 'services', label: t.services },
    { value: 'retail', label: t.retail },
    { value: 'food', label: t.food },
    { value: 'health', label: t.health },
    { value: 'education', label: t.education },
    { value: 'technology', label: t.technology },
    { value: 'others', label: t.others }
  ];

  const productTypes = [
    { value: 'service', label: t.serviceType },
    { value: 'product', label: t.productSale },
    { value: 'both', label: t.bothTypes }
  ];

  const conditionOptions = [
    { value: 'new', label: t.conditionNew },
    { value: 'used', label: t.conditionUsed },
    { value: 'refurbished', label: t.conditionRefurbished }
  ];

  useEffect(() => {
    if (user && isServiceProvider) {
      fetchAdvertisements();
      fetchUserProfile();
    }
  }, [user, isServiceProvider]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('district_id, community_id')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('advertiser_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type the data properly
      const typedData = (data || []).map(ad => ({
        ...ad,
        product_type: ad.product_type as 'service' | 'product' | 'both'
      }));
      
      setAdvertisements(typedData);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !isServiceProvider) {
      toast({
        title: t.accessDenied,
        variant: 'destructive'
      });
      return;
    }

    if (!formData.title || !formData.business_name || !formData.category) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Ralat Pengesahan',
        description: language === 'en' ? 'Please fill in all required fields' : 'Sila isi semua medan yang diperlukan',
        variant: 'destructive'
      });
      return;
    }

    // Validation for product-specific fields
    if (formData.product_type === 'product' && formData.is_in_stock && formData.stock_quantity && parseInt(formData.stock_quantity) < 0) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Ralat Pengesahan',
        description: language === 'en' ? 'Stock quantity must be 0 or greater' : 'Kuantiti stok mestilah 0 atau lebih',
        variant: 'destructive'
      });
      return;
    }

    if (formData.price && parseFloat(formData.price) < 0) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Ralat Pengesahan',
        description: language === 'en' ? 'Price must be 0 or greater' : 'Harga mestilah 0 atau lebih',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build service areas array
      let serviceAreas: string[] = [];
      if (formData.target_my_district && userProfile?.district_id) {
        serviceAreas.push(userProfile.district_id);
      }
      if (formData.target_my_community && userProfile?.community_id) {
        serviceAreas.push(userProfile.community_id);
      }
      if (formData.service_areas) {
        const additionalAreas = formData.service_areas.split(',').map(area => area.trim()).filter(Boolean);
        serviceAreas.push(...additionalAreas);
      }

      const adData = {
        advertiser_id: user.id,
        title: formData.title,
        description: formData.description,
        business_name: formData.business_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        website_url: formData.website_url,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        image_url: formData.image_url,
        is_featured: formData.is_featured,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        // New fields
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        product_type: formData.product_type,
        is_in_stock: formData.product_type === 'product' ? formData.is_in_stock : null,
        stock_quantity: formData.product_type === 'product' && formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        low_stock_alert: formData.product_type === 'product' && formData.low_stock_alert ? parseInt(formData.low_stock_alert) : null,
        shipping_required: formData.product_type === 'product' ? formData.shipping_required : null,
        shipping_cost: formData.shipping_required && formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
        product_weight: formData.product_weight ? parseFloat(formData.product_weight) : null,
        condition_status: formData.product_type === 'product' ? formData.condition_status : null,
        product_dimensions: formData.product_dimensions || null,
        warranty_period: formData.warranty_period || null,
        return_policy: formData.return_policy || null,
        service_areas: serviceAreas.length > 0 ? serviceAreas : null
      };

      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update(adData)
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({ title: t.updateSuccess });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert(adData);

        if (error) throw error;
        toast({ title: t.createSuccess });
      }

      // Reset form and close dialog
      setFormData(getDefaultFormData());
      setIsCreateOpen(false);
      setEditingAd(null);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to save advertisement' : 'Gagal menyimpan iklan',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    
    // Determine targeting flags from service_areas
    let targetMyDistrict = false;
    let targetMyCommunity = false;
    let additionalAreas = '';
    
    if (ad.service_areas && userProfile) {
      targetMyDistrict = ad.service_areas.includes(userProfile.district_id);
      targetMyCommunity = ad.service_areas.includes(userProfile.community_id);
      
      const otherAreas = ad.service_areas.filter(area => 
        area !== userProfile.district_id && area !== userProfile.community_id
      );
      additionalAreas = otherAreas.join(', ');
    }
    
    setFormData({
      title: ad.title,
      description: ad.description || '',
      business_name: ad.business_name,
      contact_phone: ad.contact_phone || '',
      contact_email: ad.contact_email || '',
      website_url: ad.website_url || '',
      category: ad.category,
      tags: ad.tags?.join(', ') || '',
      image_url: ad.image_url || '',
      is_featured: ad.is_featured,
      start_date: ad.start_date?.split('T')[0] || '',
      end_date: ad.end_date?.split('T')[0] || '',
      // New fields
      price: ad.price?.toString() || '',
      currency: ad.currency || 'MYR',
      product_type: ad.product_type || 'service',
      is_in_stock: ad.is_in_stock ?? true,
      stock_quantity: ad.stock_quantity?.toString() || '',
      low_stock_alert: ad.low_stock_alert?.toString() || '5',
      shipping_required: ad.shipping_required ?? false,
      shipping_cost: ad.shipping_cost?.toString() || '',
      product_weight: ad.product_weight?.toString() || '',
      condition_status: ad.condition_status || 'new',
      product_dimensions: ad.product_dimensions || '',
      warranty_period: ad.warranty_period || '',
      return_policy: ad.return_policy || '',
      service_areas: additionalAreas,
      target_my_district: targetMyDistrict,
      target_my_community: targetMyCommunity
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;
      toast({ title: t.deleteSuccess });
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to delete advertisement' : 'Gagal memadam iklan',
        variant: 'destructive'
      });
    }
  };

  const toggleStatus = async (adId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', adId);

      if (error) throw error;
      fetchAdvertisements();
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  if (!isServiceProvider) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{t.accessDenied}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingAd(null);
            setFormData(getDefaultFormData());
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t.newAd}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? t.editTitle : t.createTitle}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              
              {/* General Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">{t.generalInfo}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">{t.businessName}*</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">{t.adTitle}*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_type">{t.productType}*</Label>
                    <Select value={formData.product_type} onValueChange={(value: 'service' | 'product' | 'both') => setFormData({...formData, product_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">{t.category}*</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">{t.tags}</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="service, repair, professional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">{t.startDate}</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">{t.endDate}</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="is_featured">{t.featured}</Label>
                </div>
              </div>

              <Separator />

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">{t.pricingInventory}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t.price}</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t.currency}</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MYR">MYR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="SGD">SGD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.product_type === 'product' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_in_stock"
                        checked={formData.is_in_stock}
                        onCheckedChange={(checked) => setFormData({...formData, is_in_stock: checked})}
                      />
                      <Label htmlFor="is_in_stock">{t.inStock}</Label>
                    </div>

                    {formData.is_in_stock && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stock_quantity">{t.stockQuantity}</Label>
                          <Input
                            id="stock_quantity"
                            type="number"
                            min="0"
                            value={formData.stock_quantity}
                            onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="low_stock_alert">{t.lowStockAlert}</Label>
                          <Input
                            id="low_stock_alert"
                            type="number"
                            min="0"
                            value={formData.low_stock_alert}
                            onChange={(e) => setFormData({...formData, low_stock_alert: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="condition_status">{t.conditionStatus}</Label>
                      <Select value={formData.condition_status} onValueChange={(value) => setFormData({...formData, condition_status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOptions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Shipping Information */}
              {formData.product_type === 'product' && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <h3 className="text-lg font-semibold">{t.shipping}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="shipping_required"
                        checked={formData.shipping_required}
                        onCheckedChange={(checked) => setFormData({...formData, shipping_required: checked})}
                      />
                      <Label htmlFor="shipping_required">{t.shippingRequired}</Label>
                    </div>

                    {formData.shipping_required && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="shipping_cost">{t.shippingCost}</Label>
                          <Input
                            id="shipping_cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.shipping_cost}
                            onChange={(e) => setFormData({...formData, shipping_cost: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product_weight">{t.productWeight}</Label>
                          <Input
                            id="product_weight"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.product_weight}
                            onChange={(e) => setFormData({...formData, product_weight: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Specifications */}
              {formData.product_type === 'product' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t.specifications}</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product_dimensions">{t.productDimensions}</Label>
                      <Input
                        id="product_dimensions"
                        value={formData.product_dimensions}
                        onChange={(e) => setFormData({...formData, product_dimensions: e.target.value})}
                        placeholder="L x W x H (cm)"
                      />
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Policies & Warranty */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.policies}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="warranty_period">{t.warrantyPeriod}</Label>
                  <Textarea
                    id="warranty_period"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({...formData, warranty_period: e.target.value})}
                    rows={2}
                    placeholder="e.g., 1 year manufacturer warranty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return_policy">{t.returnPolicy}</Label>
                  <Textarea
                    id="return_policy"
                    value={formData.return_policy}
                    onChange={(e) => setFormData({...formData, return_policy: e.target.value})}
                    rows={3}
                    placeholder="e.g., 30-day return policy, item must be in original condition"
                  />
                </div>
              </div>

              <Separator />

              {/* Service Areas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.targeting}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="target_my_district"
                      checked={formData.target_my_district}
                      onCheckedChange={(checked) => setFormData({...formData, target_my_district: checked})}
                    />
                    <Label htmlFor="target_my_district">{t.targetMyDistrict}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="target_my_community"
                      checked={formData.target_my_community}
                      onCheckedChange={(checked) => setFormData({...formData, target_my_community: checked})}
                    />
                    <Label htmlFor="target_my_community">{t.targetMyCommunity}</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_areas">{t.additionalAreas}</Label>
                    <Input
                      id="service_areas"
                      value={formData.service_areas}
                      onChange={(e) => setFormData({...formData, service_areas: e.target.value})}
                      placeholder="area-id-1, area-id-2, area-id-3"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">{t.contactPhone}</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">{t.contactEmail}</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">{t.website}</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images</h3>
                
                <ImageUpload
                  bucket="marketplace-images"
                  onUploadComplete={handleImageUpload}
                  maxFiles={1}
                  existingImages={formData.image_url ? [formData.image_url] : []}
                  onRemoveImage={() => setFormData({...formData, image_url: ''})}
                />

                <div className="space-y-2">
                  <Label htmlFor="image_url">{t.imageUrl} (fallback)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      {editingAd ? t.update : t.create}
                    </div>
                  ) : (
                    editingAd ? t.update : t.create
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : advertisements.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No advertisements yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          advertisements.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {ad.image_url && (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">{ad.title}</h3>
                        {ad.is_featured && <Badge variant="secondary">{t.featured}</Badge>}
                        {ad.is_active ? (
                          <Badge variant="default">{t.active}</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        <Badge variant="outline">{productTypes.find(p => p.value === ad.product_type)?.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{ad.business_name}</p>
                      {ad.description && (
                        <p className="text-sm mb-2 line-clamp-2">{ad.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{t.clicks}: {ad.click_count}</span>
                        <span>Category: {categories.find(c => c.value === ad.category)?.label}</span>
                        {ad.price && (
                          <span>Price: {ad.currency} {ad.price}</span>
                        )}
                        {ad.product_type === 'product' && (
                          <span>
                            Stock: {ad.is_in_stock ? ad.stock_quantity || 'Available' : 'Out of Stock'}
                          </span>
                        )}
                        {ad.service_areas && ad.service_areas.length > 0 && (
                          <span>Areas: {ad.service_areas.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 justify-end sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(ad.id, ad.is_active)}
                      className="flex-shrink-0"
                    >
                      {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="hidden xs:inline-block ml-1">
                        {ad.is_active ? 'Hide' : 'Show'}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden xs:inline-block ml-1">{t.edit}</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden xs:inline-block ml-1">{t.delete}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}