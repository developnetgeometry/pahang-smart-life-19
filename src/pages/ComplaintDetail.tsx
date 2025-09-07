import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ComplaintResponseHistory from '@/components/complaints/ComplaintResponseHistory';
import ComplaintResponseDialog from '@/components/complaints/ComplaintResponseDialog';
import { useUserRoles } from '@/hooks/use-user-roles';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  district_id: string;
  complainant_id: string;
  assigned_to: string | null;
  resolution: string | null;
  photos: string[] | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  escalation_level: number;
  escalated_at: string | null;
  escalated_by: string | null;
  auto_escalated: boolean;
}

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useAuth();
  const { t } = useTranslation(language || 'ms');
  const { hasRole } = useUserRoles();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if user can respond to complaints
  const canRespond = hasRole('facility_manager' as any) || 
                     hasRole('community_admin' as any) || 
                     hasRole('district_coordinator' as any) || 
                     hasRole('state_admin' as any) ||
                     hasRole('security_officer' as any) ||
                     hasRole('maintenance_staff' as any);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) {
        toast.error('Complaint ID not found');
        navigate('/my-complaints');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setComplaint(data);
      } catch (error) {
        console.error('Error fetching complaint:', error);
        toast.error('Failed to load complaint details');
        navigate('/my-complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
      case 'facilities':
        return '🔧';
      case 'security':
        return '🛡️';
      case 'noise':
        return '🔊';
      case 'infrastructure':
        return '🏗️';
      case 'electrical':
        return '⚡';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/my-complaints')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Complaints' : 'Kembali ke Aduan'}
          </Button>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {language === 'en' ? 'Complaint Not Found' : 'Aduan Tidak Dijumpai'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {language === 'en' 
            ? 'The complaint you are looking for does not exist or has been removed.'
            : 'Aduan yang anda cari tidak wujud atau telah dipadamkan.'}
        </p>
        <Button onClick={() => navigate('/my-complaints')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back to Complaints' : 'Kembali ke Aduan'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/my-complaints')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back to Complaints' : 'Kembali ke Aduan'}
        </Button>
        
        {canRespond && (
          <ComplaintResponseDialog
            complaintId={complaint.id}
            currentStatus={complaint.status}
            onResponseAdded={() => setRefreshKey(prev => prev + 1)}
          />
        )}
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(complaint.status)}>
            {complaint.status.replace('_', ' ')}
          </Badge>
          <Badge className={`text-white ${getPriorityColor(complaint.priority)}`}>
            {complaint.priority}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{getCategoryIcon(complaint.category)}</span>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(complaint.created_at), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{complaint.location}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {complaint.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">
              {language === 'en' ? 'Description' : 'Penerangan'}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {complaint.description}
            </p>
          </div>

          <Separator />

          {/* Photos */}
          {complaint.photos && complaint.photos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Attached Photos' : 'Gambar Dilampirkan'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complaint.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Complaint photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Timeline' : 'Garis Masa'}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Created:' : 'Dicipta:'}
                    </span>
                    <span>{format(new Date(complaint.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Last Updated:' : 'Kemaskini Terakhir:'}
                    </span>
                    <span>{format(new Date(complaint.updated_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  {complaint.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Resolved:' : 'Diselesaikan:'}
                      </span>
                      <span>{format(new Date(complaint.resolved_at), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Details' : 'Butiran'}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Escalation Level:' : 'Tahap Peningkatan:'}
                    </span>
                    <Badge variant="outline">
                      Level {complaint.escalation_level}
                    </Badge>
                  </div>
                  {complaint.auto_escalated && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-xs text-warning">
                        {language === 'en' ? 'Auto-escalated' : 'Peningkatan Automatik'}
                      </span>
                    </div>
                  )}
                  {complaint.assigned_to && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Assigned To:' : 'Ditugaskan Kepada:'}
                      </span>
                      <span>{language === 'en' ? 'Staff Member' : 'Ahli Kakitangan'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resolution */}
          {complaint.resolution && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  {language === 'en' ? 'Resolution' : 'Penyelesaian'}
                </h3>
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">
                    {complaint.resolution}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Response History */}
      <ComplaintResponseHistory 
        complaintId={complaint.id} 
        refreshKey={refreshKey}
      />
    </div>
  );
}