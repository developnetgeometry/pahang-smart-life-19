import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Clock,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Send,
  Calendar,
  FileText,
  Download,
  Eye
} from 'lucide-react';

interface ApplicationDetails {
  id: string;
  applicant_id: string;
  business_name: string;
  business_type: string;
  business_description: string;
  business_registration_number: string;
  tax_id: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  business_address: string;
  website_url: string;
  services_offered: string[];
  service_categories: string[];
  experience_years: number;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  review_notes: string;
  rejection_reason: string;
  business_references: any;
  insurance_info: any;
  social_media: any;
  applicant: {
    full_name: string;
    email: string;
  };
}

interface Communication {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  sender: {
    full_name: string;
  };
}

interface Document {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  is_verified: boolean;
  upload_date: string;
  notes: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800', 
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  additional_info_required: 'bg-orange-100 text-orange-800'
};

export default function ServiceProviderReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
      fetchCommunications();
      fetchDocuments();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('service_provider_applications')
        .select(`
          *,
          applicant:profiles!applicant_id(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setApplication(data);
      setReviewNotes(data.review_notes || '');
      setRejectionReason(data.rejection_reason || '');
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application details');
      navigate('/admin/service-providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('application_communications')
        .select(`
          id,
          message,
          message_type,
          created_at,
          sender:profiles!sender_id(full_name)
        `)
        .eq('application_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'business_registration': 'Business Registration',
      'insurance_certificate': 'Insurance Certificate',
      'tax_certificate': 'Tax Certificate',
      'license': 'Professional License',
      'id_document': 'ID Document',
      'bank_statement': 'Bank Statement',
      'other': 'Other Document'
    };
    return types[type] || type;
  };

  const updateApplicationStatus = async (newStatus: string) => {
    if (!application || !user) return;
    
    setActionLoading(true);
    try {
      const updateData: any = {
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      };

      if (newStatus === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('service_provider_applications')
        .update(updateData)
        .eq('id', application.id);

      if (error) throw error;

      // If approved, create service provider profile
      if (newStatus === 'approved') {
        await createServiceProviderProfile();
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-application-status-email', {
          body: {
            applicationId: application.id,
            applicantEmail: application.applicant.email,
            applicantName: application.applicant.full_name,
            businessName: application.business_name,
            status: newStatus,
            reviewNotes: reviewNotes,
            rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined
          }
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't throw error here as the main action was successful
        toast.error('Status updated but email notification failed to send');
      }

      const statusLabels = {
        approved: 'approved',
        rejected: 'rejected',
        additional_info_required: 'marked as requiring additional information'
      };

      toast.success(`Application ${statusLabels[newStatus as keyof typeof statusLabels] || newStatus} successfully. Email notification sent to applicant.`);
      fetchApplicationDetails();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    } finally {
      setActionLoading(false);
    }
  };

  const createServiceProviderProfile = async () => {
    if (!application) return;

    try {
      const profileData = {
        user_id: application.applicant_id,
        application_id: application.id,
        district_id: user?.active_community_id,
        business_name: application.business_name,
        business_type: application.business_type,
        business_description: application.business_description,
        services_offered: application.services_offered,
        service_categories: application.service_categories,
        contact_phone: application.contact_phone,
        contact_email: application.contact_email,
        business_address: application.business_address,
        website_url: application.website_url,
        social_media: application.social_media,
        is_active: true,
        is_verified: true,
      };

      const { error } = await supabase
        .from('service_provider_profiles')
        .insert(profileData);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating provider profile:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !application || !user) return;

    try {
      const { error } = await supabase
        .from('application_communications')
        .insert({
          application_id: application.id,
          sender_id: user.id,
          message: newMessage,
          message_type: 'note',
          is_internal: false,
        });

      if (error) throw error;

      setNewMessage('');
      fetchCommunications();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Application not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost" 
          onClick={() => navigate('/admin/service-providers')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {application.business_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{application.business_name}</h1>
              <p className="text-muted-foreground">
                Application Review • {application.business_type}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge className={STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Business Name</Label>
                  <p className="text-sm text-muted-foreground mt-1">{application.business_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Type</Label>
                  <p className="text-sm text-muted-foreground mt-1">{application.business_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Registration Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.business_registration_number || 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tax ID</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.tax_id || 'Not provided'}
                  </p>
                </div>
              </div>
              
              {application.business_description && (
                <div>
                  <Label className="text-sm font-medium">Business Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.business_description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">Contact Person</Label>
                    <p className="text-sm text-muted-foreground">{application.contact_person}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">{application.contact_phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{application.contact_email}</p>
                  </div>
                </div>
                
                {application.website_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Website</Label>
                      <a 
                        href={application.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {application.website_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <Label className="text-sm font-medium">Business Address</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.business_address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services & Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Service Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {application.service_categories.map(category => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {application.services_offered.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Specific Services</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {application.services_offered.map(service => (
                      <Badge key={service} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {application.experience_years && (
                <div>
                  <Label className="text-sm font-medium">Experience</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.experience_years} years
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Documents
              </CardTitle>
              <CardDescription>
                Documents submitted by the applicant for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{getDocumentTypeLabel(doc.document_type)}</span>
                            <span>{formatFileSize(doc.file_size || 0)}</span>
                            <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                          </div>
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Note: {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.is_verified && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.file_url;
                            link.download = doc.document_name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Communications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {communications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No communications yet
                  </p>
                ) : (
                  communications.map(comm => (
                    <div key={comm.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comm.sender.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{comm.sender.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comm.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm">{comm.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note or message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge 
                  className={`${STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]} text-lg px-4 py-2`}
                >
                  {application.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                </div>
                {application.updated_at !== application.created_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Updated: {new Date(application.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          {application.status !== 'approved' && application.status !== 'rejected' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add internal notes about this application..."
                    rows={3}
                  />
                </div>

                {application.status !== 'rejected' && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateApplicationStatus('approved')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                )}

                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)..."
                    rows={2}
                  />
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => updateApplicationStatus('rejected')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateApplicationStatus('additional_info_required')}
                  disabled={actionLoading}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request More Info
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}