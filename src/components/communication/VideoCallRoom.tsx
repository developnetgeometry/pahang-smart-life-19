import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  MessageCircle,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking: boolean;
  isHost: boolean;
}

interface VideoCallRoomProps {
  roomId: string;
  isHost: boolean;
  onLeave: () => void;
  onToggleChat: () => void;
  className?: string;
}

export default function VideoCallRoom({ 
  roomId, 
  isHost, 
  onLeave, 
  onToggleChat,
  className = '' 
}: VideoCallRoomProps) {
  const { user, language } = useAuth();
  const { toast } = useToast();
  
  // Video/Audio state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  
  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Update call duration every second
    const interval = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
        setCallDuration(duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const initializeCall = async () => {
    try {
      callStartTimeRef.current = new Date();
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user' 
        },
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true 
        }
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Mock participants for demo
      setParticipants([
        {
          id: user?.id || 'current-user',
          name: 'You',
          isVideoEnabled: true,
          isAudioEnabled: true,
          isSpeaking: false,
          isHost: isHost,
        },
        {
          id: 'participant-1',
          name: 'Sarah Chen',
          avatar: 'SC',
          isVideoEnabled: true,
          isAudioEnabled: true,
          isSpeaking: false,
          isHost: false,
        },
        {
          id: 'participant-2', 
          name: 'Mike Johnson',
          avatar: 'MJ',
          isVideoEnabled: false,
          isAudioEnabled: true,
          isSpeaking: true,
          isHost: false,
        }
      ]);

      toast({
        title: language === 'en' ? 'Call Started' : 'Panggilan Dimulakan',
        description: language === 'en' ? 'Video call is now active' : 'Panggilan video kini aktif',
      });
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: language === 'en' ? 'Camera Error' : 'Ralat Kamera',
        description: language === 'en' ? 'Failed to access camera/microphone' : 'Gagal mengakses kamera/mikrofon',
        variant: 'destructive',
      });
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        
        // Restore camera
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        
        setIsScreenSharing(false);
        toast({
          title: language === 'en' ? 'Screen Share Stopped' : 'Perkongsian Skrin Dihentikan',
        });
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        screenStreamRef.current = screenStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        toast({
          title: language === 'en' ? 'Screen Share Started' : 'Perkongsian Skrin Dimulakan',
        });
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: language === 'en' ? 'Screen Share Error' : 'Ralat Perkongsian Skrin',
        description: language === 'en' ? 'Failed to share screen' : 'Gagal berkongsi skrin',
        variant: 'destructive',
      });
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/communication?room=${roomId}`;
    navigator.clipboard.writeText(roomLink);
    toast({
      title: language === 'en' ? 'Link Copied' : 'Pautan Disalin',
      description: language === 'en' ? 'Room link copied to clipboard' : 'Pautan bilik disalin ke papan keratan',
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 bg-black rounded-lg overflow-hidden z-50 ${className}`}>
      {/* Main Video Area */}
      <div 
        className="relative h-full flex items-center justify-center"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Video Off Placeholder */}
        {!isVideoEnabled && !isScreenSharing && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <Avatar className="w-32 h-32">
              <AvatarFallback className="text-4xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Participants Grid (when multiple participants) */}
        {participants.length > 1 && (
          <div className="absolute top-4 right-4 grid grid-cols-1 gap-2 max-w-xs z-10">
            {participants.slice(1).map((participant) => (
              <Card key={participant.id} className="relative bg-black/70 backdrop-blur-sm border-gray-600">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-800 rounded">
                    {participant.isVideoEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{participant.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{participant.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    {/* Participant Info */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {participant.name}
                      </Badge>
                      {participant.isHost && (
                        <Badge variant="default" className="text-xs">Host</Badge>
                      )}
                    </div>

                    {/* Audio Indicator */}
                    <div className="absolute top-2 left-2">
                      {participant.isSpeaking && (
                        <Badge className="bg-green-500 animate-pulse">
                          <Volume2 className="w-3 h-3" />
                        </Badge>
                      )}
                      {!participant.isAudioEnabled && (
                        <Badge variant="destructive">
                          <MicOff className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call Info */}
        <div className="absolute top-4 left-4 z-10">
          <Card className="bg-black/70 border-gray-600 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'Live' : 'Langsung'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{participants.length}</span>
                </div>
                
                <span className="text-sm font-mono">
                  {formatDuration(callDuration)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <Card className="bg-black/80 border-gray-600 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {/* Audio Toggle */}
                  <Button
                    variant={isAudioEnabled ? "secondary" : "destructive"}
                    size="sm"
                    onClick={toggleAudio}
                    className="rounded-full w-12 h-12"
                  >
                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>

                  {/* Video Toggle */}
                  <Button
                    variant={isVideoEnabled ? "secondary" : "destructive"}
                    size="sm"
                    onClick={toggleVideo}
                    className="rounded-full w-12 h-12"
                  >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  {/* Screen Share */}
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="sm"
                    onClick={toggleScreenShare}
                    className="rounded-full w-12 h-12"
                  >
                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </Button>

                  {/* Chat Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleChat}
                    className="rounded-full w-12 h-12"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>

                  {/* Copy Link */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRoomLink}
                    className="rounded-full w-12 h-12"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>

                  {/* Fullscreen */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="rounded-full w-12 h-12"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </Button>

                  {/* End Call */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onLeave}
                    className="rounded-full w-12 h-12 ml-2"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}