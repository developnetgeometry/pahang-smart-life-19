import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, Search, Edit, Eye, Calendar, DollarSign, MapPin, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const assetSchema = z.object({
  asset_code: z.string().min(1, 'Asset code is required'),
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  asset_type: z.string().min(1, 'Asset type is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_price: z.string().optional(),
  current_value: z.string().optional(),
  condition_status: z.string().min(1, 'Condition is required'),
  location: z.string().min(1, 'Location is required'),
  warranty_expiry: z.string().optional(),
  maintenance_schedule: z.string().optional(),
  notes: z.string().optional(),
});

type Asset = {
  id: string;
  name: string;
  description?: string;
  asset_type: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  condition_status: string;
  location: string;
  purchase_price?: number;
  current_value?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  created_at: string;
} & any; // Allow additional fields from database

export default function AssetManagement() {
  const { hasRole, language } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      asset_code: '',
      name: '',
      description: '',
      asset_type: '',
      subcategory: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_price: '',
      current_value: '',
      condition_status: 'good',
      location: '',
      warranty_expiry: '',
      maintenance_schedule: '',
      notes: '',
    },
  });

  const categories = [
    'furniture', 'equipment', 'infrastructure', 'vehicle', 'electronics', 'appliances'
  ];

  const conditionOptions = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-500' },
    { value: 'good', label: 'Good', color: 'bg-blue-500' },
    { value: 'fair', label: 'Fair', color: 'bg-yellow-500' },
    { value: 'poor', label: 'Poor', color: 'bg-orange-500' },
    { value: 'needs_replacement', label: 'Needs Replacement', color: 'bg-red-500' }
  ];

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const onSubmit = async (values: z.infer<typeof assetSchema>) => {
    try {
      const assetData = {
        name: values.name,
        description: values.description || null,
        asset_type: values.asset_type,
        brand: values.brand || null,
        model: values.model || null,
        serial_number: values.serial_number || null,
        purchase_price: values.purchase_price ? parseFloat(values.purchase_price) : null,
        current_value: values.current_value ? parseFloat(values.current_value) : null,
        condition_status: values.condition_status || null,
        location: values.location,
        warranty_expiry: values.warranty_expiry || null,
        maintenance_schedule: values.maintenance_schedule || null,
        district_id: null, // Will be set based on user's district
      };

      if (editingAsset) {
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', editingAsset.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Asset updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('assets')
          .insert([assetData]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Asset created successfully',
        });
      }

      setDialogOpen(false);
      setEditingAsset(null);
      form.reset();
      fetchAssets();
    } catch (error: any) {
      console.error('Error saving asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save asset',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    form.reset({
      name: asset.name,
      description: asset.description || '',
      asset_type: asset.asset_type,
      subcategory: asset.subcategory || '',
      brand: asset.brand || '',
      model: asset.model || '',
      purchase_price: asset.purchase_price?.toString() || '',
      current_value: asset.current_value?.toString() || '',
      condition_status: asset.condition_status,
      location: asset.location,
      warranty_expiry: asset.warranty_expiry || '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.asset_code && asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || asset.asset_type === categoryFilter;
    const matchesCondition = !conditionFilter || conditionFilter === 'all' || asset.condition_status === conditionFilter;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const canManage = hasRole('facility_manager') || hasRole('community_admin') || 
                   hasRole('district_coordinator') || hasRole('state_admin');

  const getConditionBadge = (condition: string) => {
    const conditionConfig = conditionOptions.find(opt => opt.value === condition);
    return (
      <Badge className={`${conditionConfig?.color || 'bg-gray-500'} text-white`}>
        {conditionConfig?.label || condition}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Asset Management' : 'Pengurusan Aset'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Track and manage facility assets, equipment, and infrastructure'
              : 'Jejaki dan urus aset kemudahan, peralatan, dan infrastruktur'
            }
          </p>
        </div>

        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAsset(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Add Asset' : 'Tambah Aset'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAsset 
                    ? (language === 'en' ? 'Edit Asset' : 'Edit Aset')
                    : (language === 'en' ? 'Add New Asset' : 'Tambah Aset Baru')
                  }
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? 'Enter the asset details below'
                    : 'Masukkan butiran aset di bawah'
                  }
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Conference Table" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Asset description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="asset_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select asset type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditionOptions.map(condition => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Model number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serial_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number</FormLabel>
                          <FormControl>
                            <Input placeholder="SN123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Building A, Floor 2, Room 201" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purchase_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price (RM)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Value (RM)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAsset ? 'Update Asset' : 'Create Asset'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {conditionOptions.map(condition => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    ID: {asset.id}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(asset)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Asset Type:</span>
                <Badge variant="outline">
                  {asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Condition:</span>
                {getConditionBadge(asset.condition_status)}
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{asset.location}</span>
              </div>

              {asset.purchase_price && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>RM {asset.purchase_price.toLocaleString()}</span>
                </div>
              )}

              {asset.brand && asset.model && (
                <div className="text-sm text-muted-foreground">
                  {asset.brand} - {asset.model}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No assets found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter || conditionFilter
                ? 'Try adjusting your filters'
                : 'Get started by adding your first asset'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}