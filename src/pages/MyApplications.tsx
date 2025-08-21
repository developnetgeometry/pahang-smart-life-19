import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Building, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  business_name: string;
  business_type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  review_notes: string;
  rejection_reason: string;
  service_categories: string[];
}

const STATUS_CONFIG = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    message: 'Your application is pending review by the community administrator.'
  },
  under_review: {
    color: 'bg-blue-100 text-blue-800',
    icon: Eye,
    message: 'Your application is currently being reviewed.'
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    message: 'Congratulations! Your application has been approved.'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    message: 'Your application was not approved at this time.'
  },
  additional_info_required: {
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
    message: 'Additional information is required for your application.'
  }
};

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('service_provider_applications')
        .select('*')
        .eq('applicant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Service Provider Applications</h1>
              <p className="text-muted-foreground">
                Track the status of your service provider applications
              </p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/service-provider-application')}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any service provider applications yet.
              </p>
              <Button onClick={() => navigate('/service-provider-application')}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{app.business_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {app.business_type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {app.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Applied: {new Date(app.created_at).toLocaleDateString()}
                          </div>
                          
                          {app.updated_at !== app.created_at && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Updated: {new Date(app.updated_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <Alert className="mb-4">
                          <StatusIcon className="h-4 w-4" />
                          <AlertDescription>
                            {statusConfig.message}
                            {app.rejection_reason && app.status === 'rejected' && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>Reason:</strong> {app.rejection_reason}
                              </div>
                            )}
                            {app.review_notes && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>Admin Notes:</strong> {app.review_notes}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>

                        <div className="flex flex-wrap gap-2">
                          {app.service_categories.slice(0, 4).map(category => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {app.service_categories.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.service_categories.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {app.status === 'rejected' && (
                          <Button 
                            size="sm" 
                            onClick={() => navigate('/service-provider-application')}
                            className="whitespace-nowrap"
                          >
                            Reapply
                          </Button>
                        )}
                        
                        {app.status === 'additional_info_required' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/service-provider-application?edit=${app.id}`)}
                            className="whitespace-nowrap"
                          >
                            Update Application
                          </Button>
                        )}

                        {app.status === 'approved' && (
                          <Button 
                            size="sm" 
                            onClick={() => navigate('/service-provider-profile')}
                            className="whitespace-nowrap"
                          >
                            Manage Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}