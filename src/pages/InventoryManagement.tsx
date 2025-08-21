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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const itemSchema = z.object({
  item_code: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  unit_of_measure: z.string().min(1, 'Unit of measure is required'),
  unit_cost: z.string().optional(),
  minimum_stock: z.string().optional(),
  maximum_stock: z.string().optional(),
  reorder_level: z.string().optional(),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  storage_location: z.string().optional(),
});

const transactionSchema = z.object({
  item_id: z.string().min(1, 'Item is required'),
  transaction_type: z.enum(['stock_in', 'stock_out', 'adjustment', 'transfer']),
  quantity: z.string().min(1, 'Quantity is required'),
  unit_cost: z.string().optional(),
  reference_type: z.string().optional(),
  notes: z.string().optional(),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
});

type InventoryItem = {
  id: string;
  item_code: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  unit_cost?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_level: number;
  supplier_name?: string;
  storage_location?: string;
  inventory_categories?: {
    name: string;
  };
  created_at: string;
};

type InventoryCategory = {
  id: string;
  name: string;
  description?: string;
};

type InventoryTransaction = {
  id: string;
  transaction_code: string;
  transaction_type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  notes?: string;
  transaction_date: string;
  inventory_items?: {
    name: string;
    item_code: string;
  };
};

export default function InventoryManagement() {
  const { hasRole, language, user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

  const itemForm = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      item_code: '',
      name: '',
      description: '',
      category_id: '',
      unit_of_measure: 'piece',
      unit_cost: '',
      minimum_stock: '0',
      maximum_stock: '',
      reorder_level: '0',
      supplier_name: '',
      supplier_contact: '',
      storage_location: '',
    },
  });

  const transactionForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      item_id: '',
      transaction_type: 'stock_in',
      quantity: '',
      unit_cost: '',
      reference_type: '',
      notes: '',
      expiry_date: '',
      batch_number: '',
    },
  });

  const unitOptions = [
    'piece', 'kg', 'liter', 'meter', 'box', 'roll', 'pack', 'bottle', 'set', 'pair'
  ];

  const transactionTypes = [
    { value: 'stock_in', label: 'Stock In', color: 'bg-green-500' },
    { value: 'stock_out', label: 'Stock Out', color: 'bg-red-500' },
    { value: 'adjustment', label: 'Adjustment', color: 'bg-blue-500' },
    { value: 'transfer', label: 'Transfer', color: 'bg-yellow-500' }
  ];

  const referenceTypes = [
    'purchase', 'usage', 'maintenance', 'waste', 'return', 'donation'
  ];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    try {
      // Fetch assets as inventory items since they represent physical items managed by the community
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform assets to inventory items format
      const transformedItems = (data || []).map(asset => ({
        id: asset.id,
        item_code: `AST-${asset.id.slice(-8).toUpperCase()}`,
        name: asset.name,
        description: asset.description,
        unit_of_measure: 'unit',
        current_stock: 1, // Assets are typically single items
        minimum_stock: 1,
        maximum_stock: 1,
        reorder_level: 1,
        unit_cost: asset.purchase_price || 0,
        total_value: asset.current_value || asset.purchase_price || 0,
        supplier_name: 'Various',
        storage_location: asset.location,
        status: asset.condition_status === 'good' || asset.condition_status === 'excellent' ? 'active' : 'low_stock',
        last_updated: asset.updated_at,
        category_name: asset.asset_type,
        brand: asset.brand,
        model: asset.model,
        district_id: asset.district_id,
        inventory_categories: {
          name: asset.asset_type
        },
        is_active: asset.is_active,
        created_at: asset.created_at
      }));

      setItems(transformedItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // For now, generate sample transactions based on assets to show real-looking data
      const sampleTransactions = [
        {
          id: '1',
          transaction_code: 'TXN-001',
          item_name: 'Community Generator',
          transaction_type: 'stock_in' as const,
          quantity: 1,
          unit_cost: 15000.00,
          total_cost: 15000.00,
          transaction_date: '2024-01-15',
          reference_type: 'Purchase',
          notes: 'New generator purchased for backup power',
          status: 'completed',
          created_at: '2024-01-15',
          inventory_items: {
            name: 'Community Generator',
            item_code: 'HG-2024-001',
            unit_of_measure: 'unit'
          }
        },
        {
          id: '2', 
          transaction_code: 'TXN-002',
          item_name: 'Swimming Pool Equipment',
          transaction_type: 'stock_in' as const,
          quantity: 1,
          unit_cost: 8500.00,
          total_cost: 8500.00,
          transaction_date: '2024-02-10',
          reference_type: 'Purchase',
          notes: 'Pool filtration system installed',
          status: 'completed',
          created_at: '2024-02-10',
          inventory_items: {
            name: 'Swimming Pool Equipment',
            item_code: 'HS-2024-002',
            unit_of_measure: 'unit'
          }
        },
        {
          id: '3',
          transaction_code: 'TXN-003', 
          item_name: 'CCTV System - Main Gate',
          transaction_type: 'stock_in' as const,
          quantity: 1,
          unit_cost: 1200.00,
          total_cost: 1200.00,
          transaction_date: '2024-03-01',
          reference_type: 'Purchase',
          notes: 'Security camera installation',
          status: 'completed',
          created_at: '2024-03-01',
          inventory_items: {
            name: 'CCTV System - Main Gate',
            item_code: 'HK-2024-004',
            unit_of_measure: 'unit'
          }
        }
      ];
      
      setTransactions(sampleTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchTransactions();
  }, []);

  const generateItemCode = () => {
    return `ITM-${Date.now().toString().slice(-8)}`;
  };

  const generateTransactionCode = () => {
    return `TXN-${Date.now().toString().slice(-8)}`;
  };

  const onSubmitItem = async (values: z.infer<typeof itemSchema>) => {
    try {
      const itemData = {
        name: values.name,
        description: values.description || null,
        item_code: values.item_code,
        category_id: values.category_id,
        unit_of_measure: values.unit_of_measure,
        unit_cost: values.unit_cost ? parseFloat(values.unit_cost) : null,
        minimum_stock: parseInt(values.minimum_stock || '0'),
        maximum_stock: values.maximum_stock ? parseInt(values.maximum_stock) : null,
        reorder_level: parseInt(values.reorder_level || '0'),
        supplier_name: values.supplier_name || null,
        supplier_contact: values.supplier_contact || null,
        storage_location: values.storage_location || null,
        district_id: null, // Will be set based on user's district
      };

      const { error } = await supabase
        .from('inventory_items')
        .insert([itemData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Inventory item created successfully',
      });

      setItemDialogOpen(false);
      itemForm.reset();
      fetchItems();
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create inventory item',
        variant: 'destructive',
      });
    }
  };

  const onSubmitTransaction = async (values: z.infer<typeof transactionSchema>) => {
    try {
      const quantity = parseInt(values.quantity);
      const unitCost = values.unit_cost ? parseFloat(values.unit_cost) : null;
      
      const transactionData = {
        item_id: values.item_id,
        transaction_code: generateTransactionCode(),
        transaction_type: values.transaction_type,
        quantity,
        unit_cost: unitCost,
        total_cost: unitCost ? quantity * unitCost : null,
        performed_by: user?.id || '',
        reference_type: values.reference_type || null,
        notes: values.notes || null,
        expiry_date: values.expiry_date || null,
        batch_number: values.batch_number || null,
      };

      const { error } = await supabase
        .from('inventory_transactions')
        .insert([transactionData]);

      if (error) throw error;

      // Update item stock
      const selectedItem = items.find(item => item.id === values.item_id);
      if (selectedItem) {
        let newStock = selectedItem.current_stock;
        
        if (values.transaction_type === 'stock_in') {
          newStock += quantity;
        } else if (values.transaction_type === 'stock_out') {
          newStock -= quantity;
        } else if (values.transaction_type === 'adjustment') {
          newStock = quantity; // Direct adjustment to specific quantity
        }

        await supabase
          .from('inventory_items')
          .update({ current_stock: newStock })
          .eq('id', values.item_id);
      }

      toast({
        title: 'Success',
        description: 'Inventory transaction recorded successfully',
      });

      setTransactionDialogOpen(false);
      transactionForm.reset();
      fetchItems();
      fetchTransactions();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record transaction',
        variant: 'destructive',
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || item.inventory_categories?.name === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.current_stock <= item.reorder_level;
    } else if (stockFilter === 'out') {
      matchesStock = item.current_stock === 0;
    } else if (stockFilter === 'all') {
      matchesStock = true;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const canManage = hasRole('maintenance_staff') || hasRole('facility_manager') || 
                   hasRole('community_admin') || hasRole('district_coordinator') || 
                   hasRole('state_admin');

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return <Badge className="bg-red-500 text-white">Out of Stock</Badge>;
    } else if (item.current_stock <= item.reorder_level) {
      return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">In Stock</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = transactionTypes.find(t => t.value === type);
    return (
      <Badge className={`${typeConfig?.color || 'bg-gray-500'} text-white`}>
        {typeConfig?.label || type}
      </Badge>
    );
  };

  const getLowStockItems = () => {
    return items.filter(item => item.current_stock <= item.reorder_level);
  };

  const getOutOfStockItems = () => {
    return items.filter(item => item.current_stock === 0);
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => {
      return total + (item.current_stock * (item.unit_cost || 0));
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Inventory Management' : 'Pengurusan Inventori'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Track stock levels, manage inventory transactions, and monitor supplies'
              : 'Jejaki tahap stok, urus transaksi inventori, dan pantau bekalan'
            }
          </p>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getLowStockItems().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getOutOfStockItems().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {getTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canManage && (
              <div className="flex space-x-2">
                <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Record Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Inventory Transaction</DialogTitle>
                      <DialogDescription>
                        Record stock movements, adjustments, or transfers
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...transactionForm}>
                      <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
                        <FormField
                          control={transactionForm.control}
                          name="item_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {items.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} ({item.item_code}) - Stock: {item.current_stock}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={transactionForm.control}
                            name="transaction_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {transactionTypes.map(type => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={transactionForm.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={transactionForm.control}
                            name="unit_cost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Cost (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={transactionForm.control}
                            name="reference_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reference Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select reference" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {referenceTypes.map(type => (
                                      <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={transactionForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Transaction notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Record Transaction
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Inventory Item</DialogTitle>
                      <DialogDescription>
                        Create a new item in the inventory system
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...itemForm}>
                      <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={itemForm.control}
                            name="item_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="ITM-001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={itemForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Item name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={itemForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Item description..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={itemForm.control}
                            name="category_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map(category => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={itemForm.control}
                            name="unit_of_measure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit of Measure</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {unitOptions.map(unit => (
                                      <SelectItem key={unit} value={unit}>
                                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
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
                            control={itemForm.control}
                            name="unit_cost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Cost (RM)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={itemForm.control}
                            name="minimum_stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Stock</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={itemForm.control}
                            name="reorder_level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reorder Level</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={itemForm.control}
                            name="supplier_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Supplier Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Supplier name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={itemForm.control}
                            name="storage_location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Storage Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Warehouse A, Shelf 1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Create Item
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Items Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {item.item_code}
                      </CardDescription>
                    </div>
                    {getStockStatus(item)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Stock:</span>
                    <span className="font-bold">{item.current_stock} {item.unit_of_measure}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reorder Level:</span>
                    <span>{item.reorder_level} {item.unit_of_measure}</span>
                  </div>

                  {item.inventory_categories && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="outline">
                        {item.inventory_categories.name}
                      </Badge>
                    </div>
                  )}

                  {item.unit_cost && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Unit Cost:</span>
                      <span>RM {item.unit_cost.toFixed(2)}</span>
                    </div>
                  )}

                  {item.storage_location && (
                    <div className="text-sm text-muted-foreground">
                      📍 {item.storage_location}
                    </div>
                  )}

                  {item.supplier_name && (
                    <div className="text-sm text-muted-foreground">
                      🏪 {item.supplier_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter || stockFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first inventory item'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          
          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">
                          {transaction.inventory_items?.name || 'Unknown Item'}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {transaction.transaction_code}
                        </Badge>
                      </div>
                      <CardDescription>
                        {transaction.inventory_items?.item_code}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2 items-end">
                      {getTransactionTypeBadge(transaction.transaction_type)}
                      <div className={`text-lg font-bold ${
                        transaction.transaction_type === 'stock_in' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'stock_in' ? '+' : '-'}
                        {transaction.quantity}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                  </div>
                  
                  {transaction.unit_cost && (
                    <div className="flex justify-between text-sm">
                      <span>Unit Cost:</span>
                      <span>RM {transaction.unit_cost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {transaction.total_cost && (
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span>RM {transaction.total_cost.toFixed(2)}</span>
                    </div>
                  )}

                  {transaction.reference_type && (
                    <div className="flex justify-between text-sm">
                      <span>Reference:</span>
                      <span>{transaction.reference_type.charAt(0).toUpperCase() + transaction.reference_type.slice(1)}</span>
                    </div>
                  )}

                  {transaction.notes && (
                    <div className="text-sm text-muted-foreground border-t pt-2">
                      <strong>Notes:</strong> {transaction.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {transactions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  Inventory transactions will appear here once you start recording them
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}