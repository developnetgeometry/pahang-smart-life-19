import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Save, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BufferTime {
  id: string;
  facility_id: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  cleaning_time_minutes: number;
  is_active: boolean;
}

interface Facility {
  id: string;
  name: string;
}

interface FacilityBufferTimeManagerProps {
  facilities: Facility[];
}

export default function FacilityBufferTimeManager({ facilities }: FacilityBufferTimeManagerProps) {
  const { language } = useAuth();
  const { toast } = useToast();

  const [bufferTimes, setBufferTimes] = useState<Record<string, BufferTime>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const t = {
    title: language === 'en' ? 'Buffer Time Management' : 'Pengurusan Masa Penampan',
    description: language === 'en' 
      ? 'Configure buffer times between bookings to prevent conflicts and allow for cleaning' 
      : 'Konfigurasi masa penampan antara tempahan untuk mencegah konflik dan membenarkan pembersihan',
    bufferBefore: language === 'en' ? 'Buffer Before (minutes)' : 'Penampan Sebelum (minit)',
    bufferAfter: language === 'en' ? 'Buffer After (minutes)' : 'Penampan Selepas (minit)',
    cleaningTime: language === 'en' ? 'Cleaning Time (minutes)' : 'Masa Pembersihan (minit)',
    active: language === 'en' ? 'Active' : 'Aktif',
    save: language === 'en' ? 'Save' : 'Simpan',
    saved: language === 'en' ? 'Buffer times saved successfully' : 'Masa penampan berjaya disimpan',
    error: language === 'en' ? 'Error saving buffer times' : 'Ralat menyimpan masa penampan',
    loadingError: language === 'en' ? 'Error loading buffer times' : 'Ralat memuatkan masa penampan',
    beforeDesc: language === 'en' 
      ? 'Time to wait before the booking starts' 
      : 'Masa menunggu sebelum tempahan bermula',
    afterDesc: language === 'en' 
      ? 'Time to wait after the booking ends' 
      : 'Masa menunggu selepas tempahan berakhir',
    cleaningDesc: language === 'en' 
      ? 'Additional time for cleaning and maintenance' 
      : 'Masa tambahan untuk pembersihan dan penyelenggaraan',
    noConflicts: language === 'en' ? 'No conflicts' : 'Tiada konflik',
    conflictPrevention: language === 'en' ? 'Conflict Prevention' : 'Pencegahan Konflik'
  };

  useEffect(() => {
    fetchBufferTimes();
  }, [facilities]);

  const fetchBufferTimes = async () => {
    try {
      setLoading(true);

      const facilityIds = facilities.map(f => f.id);
      const { data, error } = await supabase
        .from('facility_buffer_times')
        .select('*')
        .in('facility_id', facilityIds);

      if (error) throw error;

      const bufferTimeMap: Record<string, BufferTime> = {};
      
      // Initialize with defaults for facilities without buffer times
      facilities.forEach(facility => {
        bufferTimeMap[facility.id] = {
          id: '',
          facility_id: facility.id,
          buffer_before_minutes: 0,
          buffer_after_minutes: 0,
          cleaning_time_minutes: 0,
          is_active: true
        };
      });

      // Override with existing data
      data?.forEach(bufferTime => {
        bufferTimeMap[bufferTime.facility_id] = bufferTime;
      });

      setBufferTimes(bufferTimeMap);
    } catch (error) {
      console.error('Error fetching buffer times:', error);
      toast({
        title: t.loadingError,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (facilityId: string) => {
    const bufferTime = bufferTimes[facilityId];
    if (!bufferTime) return;

    try {
      setSaving(prev => ({ ...prev, [facilityId]: true }));

      const bufferData = {
        facility_id: facilityId,
        buffer_before_minutes: bufferTime.buffer_before_minutes,
        buffer_after_minutes: bufferTime.buffer_after_minutes,
        cleaning_time_minutes: bufferTime.cleaning_time_minutes,
        is_active: bufferTime.is_active
      };

      if (bufferTime.id) {
        // Update existing
        const { error } = await supabase
          .from('facility_buffer_times')
          .update(bufferData)
          .eq('id', bufferTime.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('facility_buffer_times')
          .insert(bufferData)
          .select()
          .single();

        if (error) throw error;

        setBufferTimes(prev => ({
          ...prev,
          [facilityId]: { ...prev[facilityId], id: data.id }
        }));
      }

      toast({
        title: t.saved
      });
    } catch (error) {
      console.error('Error saving buffer time:', error);
      toast({
        title: t.error,
        variant: 'destructive'
      });
    } finally {
      setSaving(prev => ({ ...prev, [facilityId]: false }));
    }
  };

  const updateBufferTime = (facilityId: string, field: keyof BufferTime, value: any) => {
    setBufferTimes(prev => ({
      ...prev,
      [facilityId]: {
        ...prev[facilityId],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-10 bg-muted rounded"></div>
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
          <Clock className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {facilities.map((facility) => {
            const bufferTime = bufferTimes[facility.id];
            if (!bufferTime) return null;

            const totalBufferTime = bufferTime.buffer_before_minutes + 
                                   bufferTime.buffer_after_minutes + 
                                   bufferTime.cleaning_time_minutes;

            return (
              <Card key={facility.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{facility.name}</h3>
                  <div className="flex items-center gap-3">
                    <Badge variant={bufferTime.is_active ? "default" : "secondary"}>
                      {bufferTime.is_active ? t.active : 'Inactive'}
                    </Badge>
                    {totalBufferTime > 0 && bufferTime.is_active && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t.conflictPrevention}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`before-${facility.id}`}>
                      {t.bufferBefore}
                    </Label>
                    <Input
                      id={`before-${facility.id}`}
                      type="number"
                      min="0"
                      max="120"
                      value={bufferTime.buffer_before_minutes}
                      onChange={(e) => updateBufferTime(
                        facility.id, 
                        'buffer_before_minutes', 
                        parseInt(e.target.value) || 0
                      )}
                    />
                    <p className="text-xs text-muted-foreground">{t.beforeDesc}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`after-${facility.id}`}>
                      {t.bufferAfter}
                    </Label>
                    <Input
                      id={`after-${facility.id}`}
                      type="number"
                      min="0"
                      max="120"
                      value={bufferTime.buffer_after_minutes}
                      onChange={(e) => updateBufferTime(
                        facility.id, 
                        'buffer_after_minutes', 
                        parseInt(e.target.value) || 0
                      )}
                    />
                    <p className="text-xs text-muted-foreground">{t.afterDesc}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cleaning-${facility.id}`}>
                      {t.cleaningTime}
                    </Label>
                    <Input
                      id={`cleaning-${facility.id}`}
                      type="number"
                      min="0"
                      max="180"
                      value={bufferTime.cleaning_time_minutes}
                      onChange={(e) => updateBufferTime(
                        facility.id, 
                        'cleaning_time_minutes', 
                        parseInt(e.target.value) || 0
                      )}
                    />
                    <p className="text-xs text-muted-foreground">{t.cleaningDesc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${facility.id}`}
                      checked={bufferTime.is_active}
                      onCheckedChange={(checked) => updateBufferTime(
                        facility.id, 
                        'is_active', 
                        checked
                      )}
                    />
                    <Label htmlFor={`active-${facility.id}`}>{t.active}</Label>
                  </div>

                  <Button
                    onClick={() => handleSave(facility.id)}
                    disabled={saving[facility.id]}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving[facility.id] ? 'Saving...' : t.save}
                  </Button>
                </div>

                {totalBufferTime > 0 && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>{language === 'en' ? 'Total buffer time:' : 'Jumlah masa penampan:'}</strong>{' '}
                      {totalBufferTime} {language === 'en' ? 'minutes' : 'minit'}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}