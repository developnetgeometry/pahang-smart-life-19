import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  XCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BookingConflict {
  id: string;
  booking_id_1: string;
  booking_id_2: string;
  conflict_type: string;
  severity: string;
  resolved: boolean;
  resolution_notes?: string;
  detected_at: string;
  resolved_at?: string;
  resolved_by?: string;
  booking1?: {
    id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose?: string;
    user_id: string;
    facility_id: string;
    profiles?: {
      full_name: string;
      email: string;
    };
    facilities?: {
      name: string;
    };
  };
  booking2?: {
    id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose?: string;
    user_id: string;
    facility_id: string;
    profiles?: {
      full_name: string;
      email: string;
    };
    facilities?: {
      name: string;
    };
  };
}

export default function BookingConflictManager() {
  const { user, language } = useAuth();
  const { toast } = useToast();

  const [conflicts, setConflicts] = useState<BookingConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedConflict, setSelectedConflict] = useState<BookingConflict | null>(null);

  const t = {
    title: language === 'en' ? 'Booking Conflicts' : 'Konflik Tempahan',
    description: language === 'en' 
      ? 'Manage and resolve booking conflicts detected by the system' 
      : 'Urus dan selesaikan konflik tempahan yang dikesan oleh sistem',
    severity: {
      low: language === 'en' ? 'Low' : 'Rendah',
      medium: language === 'en' ? 'Medium' : 'Sederhana',
      high: language === 'en' ? 'High' : 'Tinggi'
    },
    resolved: language === 'en' ? 'Resolved' : 'Diselesaikan',
    unresolved: language === 'en' ? 'Unresolved' : 'Belum Diselesaikan',
    resolve: language === 'en' ? 'Resolve Conflict' : 'Selesaikan Konflik',
    viewDetails: language === 'en' ? 'View Details' : 'Lihat Butiran',
    resolutionNotes: language === 'en' ? 'Resolution Notes' : 'Nota Penyelesaian',
    addNotes: language === 'en' ? 'Add resolution notes...' : 'Tambah nota penyelesaian...',
    markResolved: language === 'en' ? 'Mark as Resolved' : 'Tandakan Sebagai Selesai',
    conflictDetails: language === 'en' ? 'Conflict Details' : 'Butiran Konflik',
    booking: language === 'en' ? 'Booking' : 'Tempahan',
    facility: language === 'en' ? 'Facility' : 'Kemudahan',
    date: language === 'en' ? 'Date' : 'Tarikh',
    time: language === 'en' ? 'Time' : 'Masa',
    user: language === 'en' ? 'User' : 'Pengguna',
    purpose: language === 'en' ? 'Purpose' : 'Tujuan',
    detectedAt: language === 'en' ? 'Detected at' : 'Dikesan pada',
    resolvedAt: language === 'en' ? 'Resolved at' : 'Diselesaikan pada',
    noConflicts: language === 'en' ? 'No conflicts found' : 'Tiada konflik dijumpai',
    loadingError: language === 'en' ? 'Error loading conflicts' : 'Ralat memuatkan konflik',
    resolveSuccess: language === 'en' ? 'Conflict resolved successfully' : 'Konflik berjaya diselesaikan',
    resolveError: language === 'en' ? 'Error resolving conflict' : 'Ralat menyelesaikan konflik'
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('booking_conflicts')
        .select(`
          *,
          booking1:bookings!booking_conflicts_booking_id_1_fkey(
            id,
            booking_date,
            start_time,
            end_time,
            purpose,
            user_id,
            facility_id,
            profiles!bookings_user_id_fkey(
              full_name,
              email
            ),
            facilities!bookings_facility_id_fkey(
              name
            )
          ),
          booking2:bookings!booking_conflicts_booking_id_2_fkey(
            id,
            booking_date,
            start_time,
            end_time,
            purpose,
            user_id,
            facility_id,
            profiles!bookings_user_id_fkey(
              full_name,
              email
            ),
            facilities!bookings_facility_id_fkey(
              name
            )
          )
        `)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setConflicts(data || []);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      toast({
        title: t.loadingError,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveConflict = async (conflictId: string) => {
    if (!user) return;

    try {
      setResolving(conflictId);

      const { error } = await supabase
        .from('booking_conflicts')
        .update({
          resolved: true,
          resolution_notes: resolutionNotes.trim() || null,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', conflictId);

      if (error) throw error;

      // Update local state
      setConflicts(prev => prev.map(conflict => 
        conflict.id === conflictId 
          ? { 
              ...conflict, 
              resolved: true, 
              resolution_notes: resolutionNotes.trim() || undefined,
              resolved_at: new Date().toISOString(),
              resolved_by: user.id
            }
          : conflict
      ));

      setResolutionNotes('');
      setSelectedConflict(null);

      toast({
        title: t.resolveSuccess
      });
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: t.resolveError,
        variant: 'destructive'
      });
    } finally {
      setResolving(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.noConflicts}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <Card key={conflict.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getSeverityColor(conflict.severity) as any}
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {t.severity[conflict.severity as keyof typeof t.severity] || conflict.severity}
                    </Badge>
                    <Badge variant={conflict.resolved ? "default" : "destructive"}>
                      {conflict.resolved ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.resolved}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          {t.unresolved}
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          {t.viewDetails}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t.conflictDetails}</DialogTitle>
                          <DialogDescription>
                            {conflict.conflict_type} conflict detected on{' '}
                            {new Date(conflict.detected_at).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Booking 1 */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">{t.booking} 1</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{conflict.booking1?.facilities?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(conflict.booking1?.booking_date || '').toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {formatTime(conflict.booking1?.start_time || '')} - {formatTime(conflict.booking1?.end_time || '')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{conflict.booking1?.profiles?.full_name}</span>
                              </div>
                              {conflict.booking1?.purpose && (
                                <div className="col-span-2">
                                  <strong>{t.purpose}:</strong> {conflict.booking1.purpose}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Booking 2 */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">{t.booking} 2</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{conflict.booking2?.facilities?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(conflict.booking2?.booking_date || '').toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {formatTime(conflict.booking2?.start_time || '')} - {formatTime(conflict.booking2?.end_time || '')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{conflict.booking2?.profiles?.full_name}</span>
                              </div>
                              {conflict.booking2?.purpose && (
                                <div className="col-span-2">
                                  <strong>{t.purpose}:</strong> {conflict.booking2.purpose}
                                </div>
                              )}
                            </div>
                          </div>

                          {conflict.resolution_notes && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {t.resolutionNotes}
                              </h4>
                              <p className="text-sm">{conflict.resolution_notes}</p>
                              {conflict.resolved_at && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {t.resolvedAt}: {new Date(conflict.resolved_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {!conflict.resolved && (
                      <Dialog 
                        open={selectedConflict?.id === conflict.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setSelectedConflict(conflict);
                          } else {
                            setSelectedConflict(null);
                            setResolutionNotes('');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm">
                            {t.resolve}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t.resolve}</DialogTitle>
                            <DialogDescription>
                              Mark this conflict as resolved and add any notes about the resolution.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="resolution-notes">{t.resolutionNotes}</Label>
                              <Textarea
                                id="resolution-notes"
                                placeholder={t.addNotes}
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedConflict(null);
                                  setResolutionNotes('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleResolveConflict(conflict.id)}
                                disabled={resolving === conflict.id}
                              >
                                {resolving === conflict.id ? 'Resolving...' : t.markResolved}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{conflict.booking1?.facilities?.name}</span>
                    <span className="text-muted-foreground">
                      {new Date(conflict.booking1?.booking_date || '').toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Booking 1:</strong> {formatTime(conflict.booking1?.start_time || '')} - {formatTime(conflict.booking1?.end_time || '')}
                      <br />
                      {conflict.booking1?.profiles?.full_name}
                    </div>
                    <div>
                      <strong>Booking 2:</strong> {formatTime(conflict.booking2?.start_time || '')} - {formatTime(conflict.booking2?.end_time || '')}
                      <br />
                      {conflict.booking2?.profiles?.full_name}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {t.detectedAt}: {new Date(conflict.detected_at).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}