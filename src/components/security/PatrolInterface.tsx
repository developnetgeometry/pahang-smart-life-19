import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Camera, 
  AlertTriangle,
  Navigation,
  Flag,
  FileText
} from 'lucide-react';

interface PatrolCheckpoint {
  id: string;
  name: string;
  location: string;
  status: 'pending' | 'completed' | 'incident';
  timestamp?: string;
  notes?: string;
  photos?: string[];
}

interface PatrolInterfaceProps {
  patrolArea: string;
  patrolTime: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function PatrolInterface({ patrolArea, patrolTime, onComplete, onCancel }: PatrolInterfaceProps) {
  const { language } = useAuth();
  const { toast } = useToast();
  const [patrolStarted, setPatrolStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);

  // Mock checkpoints based on patrol area
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([
    {
      id: '1',
      name: language === 'en' ? 'Main Entrance' : 'Pintu Masuk Utama',
      location: 'Ground Floor',
      status: 'pending'
    },
    {
      id: '2', 
      name: language === 'en' ? 'Parking Level B1' : 'Tingkat Parkir B1',
      location: 'Basement 1',
      status: 'pending'
    },
    {
      id: '3',
      name: language === 'en' ? 'Recreation Area' : 'Kawasan Rekreasi',
      location: 'Level 2',
      status: 'pending'
    },
    {
      id: '4',
      name: language === 'en' ? 'Emergency Exits' : 'Pintu Keluar Kecemasan',
      location: 'All Floors',
      status: 'pending'
    }
  ]);

  const completedCheckpoints = checkpoints.filter(cp => cp.status === 'completed').length;
  const progressPercent = (completedCheckpoints / checkpoints.length) * 100;

  const handleStartPatrol = () => {
    setPatrolStarted(true);
    setStartTime(new Date());
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.error('Location error:', error);
          setCurrentLocation('Location unavailable');
        }
      );
    }

    toast({
      title: language === 'en' ? 'Patrol Started' : 'Rondaan Dimulakan',
      description: language === 'en' ? `Patrol for ${patrolArea} has begun` : `Rondaan untuk ${patrolArea} telah dimulakan`,
    });
  };

  const handleCheckpointComplete = (checkpointId: string) => {
    setCheckpoints(prev => prev.map(cp => 
      cp.id === checkpointId 
        ? { ...cp, status: 'completed', timestamp: new Date().toLocaleTimeString() }
        : cp
    ));

    toast({
      title: language === 'en' ? 'Checkpoint Completed' : 'Titik Semak Selesai',
      description: language === 'en' ? 'Checkpoint marked as completed' : 'Titik semak ditanda sebagai selesai',
    });
  };

  const handleReportIncident = (checkpointId: string) => {
    setSelectedCheckpoint(checkpointId);
    setShowIncidentDialog(true);
  };

  const handleIncidentSubmit = () => {
    if (selectedCheckpoint && incidentNotes.trim()) {
      setCheckpoints(prev => prev.map(cp => 
        cp.id === selectedCheckpoint 
          ? { ...cp, status: 'incident', notes: incidentNotes, timestamp: new Date().toLocaleTimeString() }
          : cp
      ));

      toast({
        title: language === 'en' ? 'Incident Reported' : 'Insiden Dilaporkan',
        description: language === 'en' ? 'Incident has been recorded for this checkpoint' : 'Insiden telah direkodkan untuk titik semak ini',
      });

      setShowIncidentDialog(false);
      setIncidentNotes('');
      setSelectedCheckpoint(null);
    }
  };

  const handleCompletePatrol = () => {
    const incidentCount = checkpoints.filter(cp => cp.status === 'incident').length;
    
    toast({
      title: language === 'en' ? 'Patrol Completed' : 'Rondaan Selesai',
      description: language === 'en' 
        ? `Patrol completed. ${incidentCount} incidents reported.` 
        : `Rondaan selesai. ${incidentCount} insiden dilaporkan.`,
    });
    
    onComplete();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'incident': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!patrolStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              {language === 'en' ? 'Start Security Patrol' : 'Mulakan Rondaan Keselamatan'}
            </CardTitle>
            <CardDescription>
              {language === 'en' ? 'Begin your scheduled security patrol' : 'Mulakan rondaan keselamatan yang dijadualkan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {language === 'en' ? 'Scheduled Time' : 'Masa Dijadualkan'}
                </div>
                <p className="text-lg font-bold">{patrolTime}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  {language === 'en' ? 'Patrol Area' : 'Kawasan Rondaan'}
                </div>
                <p className="text-lg font-bold">{patrolArea}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{language === 'en' ? 'Checkpoints to Visit:' : 'Titik Semak untuk Dilawati:'}</h4>
              <div className="grid gap-2">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{checkpoint.name}</p>
                      <p className="text-xs text-muted-foreground">{checkpoint.location}</p>
                    </div>
                    <Badge variant="secondary">
                      {language === 'en' ? 'Pending' : 'Menunggu'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleStartPatrol} className="flex-1">
                <Navigation className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Start Patrol' : 'Mula Rondaan'}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                {language === 'en' ? 'Cancel' : 'Batal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patrol Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                {language === 'en' ? 'Active Patrol' : 'Rondaan Aktif'}
              </CardTitle>
              <CardDescription>{patrolArea} • {language === 'en' ? 'Started' : 'Dimulakan'}: {startTime?.toLocaleTimeString()}</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {language === 'en' ? 'In Progress' : 'Dalam Proses'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>{language === 'en' ? 'Progress' : 'Kemajuan'}</span>
                <span>{completedCheckpoints}/{checkpoints.length} {language === 'en' ? 'completed' : 'selesai'}</span>
              </div>
              <Progress value={progressPercent} className="mt-2" />
            </div>
            
            {currentLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {language === 'en' ? 'Current Location' : 'Lokasi Semasa'}: {currentLocation}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints */}
      <div className="space-y-3">
        {checkpoints.map((checkpoint) => (
          <Card key={checkpoint.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{checkpoint.name}</h4>
                    <Badge className={getStatusColor(checkpoint.status)}>
                      {checkpoint.status === 'completed' && (language === 'en' ? 'Completed' : 'Selesai')}
                      {checkpoint.status === 'incident' && (language === 'en' ? 'Incident' : 'Insiden')}
                      {checkpoint.status === 'pending' && (language === 'en' ? 'Pending' : 'Menunggu')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{checkpoint.location}</p>
                  {checkpoint.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'en' ? 'Completed at' : 'Selesai pada'}: {checkpoint.timestamp}
                    </p>
                  )}
                  {checkpoint.notes && (
                    <p className="text-sm mt-2 p-2 bg-red-50 border-l-2 border-red-200">
                      {checkpoint.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {checkpoint.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReportIncident(checkpoint.id)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleCheckpointComplete(checkpoint.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {checkpoint.status !== 'pending' && (
                    <div className="flex items-center text-muted-foreground">
                      {checkpoint.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                      {checkpoint.status === 'incident' && <AlertTriangle className="h-4 w-4" />}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleCompletePatrol}
              disabled={completedCheckpoints === 0}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Complete Patrol' : 'Selesai Rondaan'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incident Report Dialog */}
      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {language === 'en' ? 'Report Incident' : 'Laporkan Insiden'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {language === 'en' ? 'Incident Details' : 'Butiran Insiden'}
              </label>
              <Textarea
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder={language === 'en' ? 'Describe the incident...' : 'Terangkan insiden...'}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleIncidentSubmit} disabled={!incidentNotes.trim()}>
                {language === 'en' ? 'Submit Report' : 'Hantar Laporan'}
              </Button>
              <Button variant="outline" onClick={() => setShowIncidentDialog(false)}>
                {language === 'en' ? 'Cancel' : 'Batal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}