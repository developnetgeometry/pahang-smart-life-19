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
import { Plus, Search, Clock, MapPin, User, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const serviceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  location: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
});

type ServiceRequest = {
  id: string;
  request_number: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  location?: string;
  preferred_date?: string;
  preferred_time?: string;
  estimated_cost?: number;
  created_at: string;
  service_categories?: {
    id: string;
    name: string;
    icon: string;
    color_code: string;
  };
  assigned_to?: string;
  requester_id: string;
};

type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_code: string;
  estimated_response_time: string;
};

export default function ServiceRequests() {
  const { user, hasRole, language } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof serviceRequestSchema>>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      priority: 'medium',
      location: '',
      preferred_date: '',
      preferred_time: '',
    },
  });

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-500' },
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-orange-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-gray-400' }
  ];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // Type assertion to handle potential type mismatches
      const typedData = (data || []).map(category => ({
        ...category,
        estimated_response_time: category.estimated_response_time as string
      }));
      
      setCategories(typedData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          service_categories (
            id,
            name,
            icon,
            color_code
          )
        `)
        .order('created_at', { ascending: false });

      // If not admin/manager, only show user's requests
      if (!hasRole('community_admin') && !hasRole('district_coordinator') && !hasRole('state_admin')) {
        query = query.eq('requester_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion to handle potential type mismatches
      const typedData = (data || []).map(request => ({
        ...request,
        priority: request.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: request.status as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
      }));
      
      setRequests(typedData);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRequests();
  }, []);

  const generateRequestNumber = () => {
    return `SR-${Date.now().toString().slice(-8)}`;
  };

  const onSubmit = async (values: z.infer<typeof serviceRequestSchema>) => {
    try {
      const requestData = {
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        priority: values.priority,
        location: values.location || null,
        preferred_date: values.preferred_date || null,
        preferred_time: values.preferred_time || null,
        request_number: generateRequestNumber(),
        requester_id: user?.id || '',
        district_id: null, // Will be set based on user's district
      };

      const { error } = await supabase
        .from('service_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service request submitted successfully',
      });

      setDialogOpen(false);
      form.reset();
      fetchRequests();
    } catch (error: any) {
      console.error('Error creating service request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit service request',
        variant: 'destructive',
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'assigned') {
        updateData.assigned_at = new Date().toISOString();
        updateData.assigned_to = user?.id;
      } else if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Request status updated successfully',
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority = !priorityFilter || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const canManage = hasRole('maintenance_staff') || hasRole('facility_manager') || 
                   hasRole('community_admin') || hasRole('district_coordinator') || 
                   hasRole('state_admin');

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorityOptions.find(opt => opt.value === priority);
    return (
      <Badge className={`${priorityConfig?.color || 'bg-gray-500'} text-white`}>
        {priorityConfig?.label || priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-500'} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Service Requests' : 'Permohonan Perkhidmatan'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Submit and track service requests for maintenance and repairs'
              : 'Hantar dan jejaki permohonan perkhidmatan untuk penyelenggaraan dan pembaikan'
            }
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'New Request' : 'Permohonan Baru'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Create Service Request' : 'Cipta Permohonan Perkhidmatan'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' 
                  ? 'Fill out the form below to submit your service request'
                  : 'Isi borang di bawah untuk hantar permohonan perkhidmatan anda'
                }
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the issue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name} - {category.description}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide detailed information about the issue or service needed..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityOptions.map(priority => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Building A, Floor 2, Room 201" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferred_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferred_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time (Optional)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
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
                    Submit Request
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                {priorityOptions.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {request.request_number}
                    </Badge>
                  </div>
                  <CardDescription>{request.description}</CardDescription>
                </div>
                <div className="flex flex-col space-y-2">
                  {getPriorityBadge(request.priority)}
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>{request.service_categories?.name || 'General'}</span>
                </div>
                
                {request.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{request.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {canManage && request.status !== 'completed' && request.status !== 'cancelled' && (
                <div className="flex space-x-2 border-t pt-4">
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'assigned')}
                    >
                      Assign to Me
                    </Button>
                  )}
                  {request.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'in_progress')}
                    >
                      Start Work
                    </Button>
                  )}
                  {request.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateRequestStatus(request.id, 'on_hold')}
                  >
                    Put on Hold
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No service requests found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter || priorityFilter
                ? 'Try adjusting your filters'
                : 'Get started by creating your first service request'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}