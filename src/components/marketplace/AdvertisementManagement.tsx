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
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

  const isServiceProvider = hasRole('service_provider');

  const [formData, setFormData] = useState({
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
    end_date: ''
  });

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
      accessDenied: 'Only service providers can manage advertisements'
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
      accessDenied: 'Hanya penyedia perkhidmatan boleh menguruskan iklan'
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

  useEffect(() => {
    if (user && isServiceProvider) {
      fetchAdvertisements();
    }
  }, [user, isServiceProvider]);

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('advertiser_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvertisements(data || []);
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

    setIsSubmitting(true);

    try {
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
        end_date: formData.end_date || null
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
      setFormData({
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
        end_date: ''
      });
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
      end_date: ad.end_date?.split('T')[0] || ''
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingAd(null);
            setFormData({
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
              end_date: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.newAd}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? t.editTitle : t.createTitle}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="tags">{t.tags}</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="service, repair, professional"
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="image_url">{t.imageUrl}</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
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
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {ad.image_url && (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{ad.title}</h3>
                        {ad.is_featured && <Badge variant="secondary">{t.featured}</Badge>}
                        {ad.is_active ? (
                          <Badge variant="default">{t.active}</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{ad.business_name}</p>
                      {ad.description && (
                        <p className="text-sm mb-2">{ad.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{t.clicks}: {ad.click_count}</span>
                        <span>Category: {categories.find(c => c.value === ad.category)?.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(ad.id, ad.is_active)}
                    >
                      {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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