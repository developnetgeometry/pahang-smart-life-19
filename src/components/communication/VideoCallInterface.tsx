import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Video, 
  Phone, 
  PhoneCall, 
  Users, 
  Calendar,
  Clock,
  User
} from 'lucide-react';

export default function VideoCallInterface() {
  const { language } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsCallActive(true);
    // In real implementation, this would connect to WebRTC
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallType(null);
  };

  if (isCallActive) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {callType === 'video' ? (
                  <Video className="w-12 h-12 text-primary" />
                ) : (
                  <Phone className="w-12 h-12 text-primary" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'en' ? 'Call in Progress' : 'Panggilan Sedang Berlangsung'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {callType === 'video' 
                  ? (language === 'en' ? 'Video call active' : 'Panggilan video aktif')
                  : (language === 'en' ? 'Audio call active' : 'Panggilan audio aktif')
                }
              </p>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Clock className="w-4 h-4" />
                <span>00:45</span>
              </div>
              <Button 
                variant="destructive" 
                onClick={endCall}
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                {language === 'en' ? 'End Call' : 'Tamat Panggilan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Call Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">
              {language === 'en' ? 'Audio Call' : 'Panggilan Audio'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Start an instant audio conversation'
                : 'Mulakan perbualan audio segera'
              }
            </p>
            <Button 
              onClick={() => startCall('audio')} 
              variant="outline" 
              className="w-full"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Start Audio Call' : 'Mula Panggilan Audio'}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">
              {language === 'en' ? 'Video Call' : 'Panggilan Video'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Start a face-to-face conversation'
                : 'Mulakan perbualan bersemuka'
              }
            </p>
            <Button 
              onClick={() => startCall('video')} 
              variant="outline" 
              className="w-full"
            >
              <Video className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Start Video Call' : 'Mula Panggilan Video'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Recent Calls' : 'Panggilan Terkini'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Your recent call history'
              : 'Sejarah panggilan terkini anda'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'Community Meeting', type: 'video', time: '2 hours ago', duration: '45 min' },
            { name: 'Security Check-in', type: 'audio', time: '1 day ago', duration: '12 min' },
            { name: 'Maintenance Update', type: 'video', time: '2 days ago', duration: '23 min' }
          ].map((call, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  call.type === 'video' ? 'bg-purple-500/10' : 'bg-blue-500/10'
                }`}>
                  {call.type === 'video' ? (
                    <Video className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Phone className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{call.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {call.time} • {call.duration}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {call.type === 'video' 
                  ? (language === 'en' ? 'Video' : 'Video')
                  : (language === 'en' ? 'Audio' : 'Audio')
                }
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Upcoming Meetings' : 'Mesyuarat Akan Datang'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Scheduled community meetings and calls'
              : 'Mesyuarat dan panggilan komuniti yang dijadualkan'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: 'Monthly Community Meeting', time: 'Tomorrow 2:00 PM', participants: 12 },
            { title: 'Facilities Planning', time: 'Friday 10:00 AM', participants: 5 }
          ].map((meeting, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{meeting.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {meeting.time} • {meeting.participants} {language === 'en' ? 'participants' : 'peserta'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {language === 'en' ? 'Join' : 'Sertai'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}