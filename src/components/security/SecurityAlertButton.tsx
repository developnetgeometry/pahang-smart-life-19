import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';  
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlertButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function SecurityAlertButton({ className, variant = 'destructive', size = 'default' }: SecurityAlertButtonProps) {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertData, setAlertData] = useState({
    alert_type: 'general',
    severity: 'medium',
    title: '',
    description: '',
    location_description: ''
  });

  const text = {
    en: {
      triggerAlert: 'Report Security Issue',
      alertDialog: 'Security Alert Report',
      alertDescription: 'Report a security concern that requires immediate attention',
      alertType: 'Alert Type',
      severity: 'Severity Level',
      title: 'Alert Title',
      description: 'Description',
      location: 'Location Description',
      submit: 'Submit Alert',
      cancel: 'Cancel',
      submitting: 'Submitting...',
      success: 'Security alert submitted successfully',
      error: 'Failed to submit security alert',
      titleRequired: 'Alert title is required',
      descriptionRequired: 'Alert description is required',
      general: 'General Security',
      suspicious: 'Suspicious Activity',
      emergency: 'Emergency',
      theft: 'Theft/Vandalism',
      safety: 'Safety Hazard',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    },
    ms: {
      triggerAlert: 'Laporkan Isu Keselamatan',
      alertDialog: 'Laporan Amaran Keselamatan',
      alertDescription: 'Laporkan kebimbangan keselamatan yang memerlukan perhatian segera',
      alertType: 'Jenis Amaran',
      severity: 'Tahap Keterukan',
      title: 'Tajuk Amaran',
      description: 'Penerangan',
      location: 'Penerangan Lokasi',
      submit: 'Hantar Amaran',
      cancel: 'Batal',
      submitting: 'Menghantar...',
      success: 'Amaran keselamatan berjaya dihantar',
      error: 'Gagal menghantar amaran keselamatan',
      titleRequired: 'Tajuk amaran diperlukan',
      descriptionRequired: 'Penerangan amaran diperlukan',
      general: 'Keselamatan Am',
      suspicious: 'Aktiviti Mencurigakan',
      emergency: 'Kecemasan',
      theft: 'Kecurian/Vandalisme',
      safety: 'Bahaya Keselamatan',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      critical: 'Kritikal'
    }
  };

  const t = text[language];

  const handleSubmit = async () => {
    if (!alertData.title.trim()) {
      toast({
        title: 'Error',
        description: t.titleRequired,
        variant: 'destructive'
      });
      return;
    }

    if (!alertData.description.trim()) {
      toast({
        title: 'Error', 
        description: t.descriptionRequired,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's current location if available
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Unable to get location:', error);
        }
      }

      // Submit security alert
      const { error } = await supabase
        .from('security_alerts')
        .insert({
          reporter_id: user?.id,
          alert_type: alertData.alert_type,
          severity: alertData.severity,
          title: alertData.title,
          description: alertData.description,
          location_description: alertData.location_description,
          location_latitude: location?.latitude,
          location_longitude: location?.longitude,
          district_id: user?.district,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: t.success
      });

      // Reset form and close dialog
      setAlertData({
        alert_type: 'general',
        severity: 'medium',
        title: '',
        description: '',
        location_description: ''
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting security alert:', error);
      toast({
        title: 'Error',
        description: t.error,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Shield className="w-4 h-4 mr-2" />
          {t.triggerAlert}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {t.alertDialog}
          </DialogTitle>
          <DialogDescription>
            {t.alertDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.alertType}</Label>
              <Select
                value={alertData.alert_type}
                onValueChange={(value) => setAlertData(prev => ({ ...prev, alert_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t.general}</SelectItem>
                  <SelectItem value="suspicious">{t.suspicious}</SelectItem>
                  <SelectItem value="emergency">{t.emergency}</SelectItem>
                  <SelectItem value="theft">{t.theft}</SelectItem>
                  <SelectItem value="safety">{t.safety}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.severity}</Label>
              <Select
                value={alertData.severity}
                onValueChange={(value) => setAlertData(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className={getSeverityColor('low')}>{t.low}</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className={getSeverityColor('medium')}>{t.medium}</span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className={getSeverityColor('high')}>{t.high}</span>
                  </SelectItem>
                  <SelectItem value="critical">
                    <span className={getSeverityColor('critical')}>{t.critical}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t.title}</Label>
            <Input
              id="title"
              value={alertData.title}
              onChange={(e) => setAlertData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of the security issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={alertData.description}
              onChange={(e) => setAlertData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of what you observed"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t.location}</Label>
            <Input
              id="location"
              value={alertData.location_description}
              onChange={(e) => setAlertData(prev => ({ ...prev, location_description: e.target.value }))}
              placeholder="Where did this occur? (e.g., Block A parking, playground)"
            />
          </div>

          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Your GPS location will be automatically captured to help security personnel respond quickly.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? t.submitting : t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}