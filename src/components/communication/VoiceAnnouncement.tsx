import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Volume2, VolumeX, Mic, Settings, Play, Square, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceSettings {
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
}

const ELEVEN_LABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' }
];

const MODELS = [
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2 (Highest Quality)' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5 (Fast, Multilingual)' },
  { id: 'eleven_turbo_v2', name: 'Turbo v2 (Fast, English Only)' },
  { id: 'eleven_multilingual_v1', name: 'Multilingual v1' }
];

export default function VoiceAnnouncement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [announcementText, setAnnouncementText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceId: '9BWtsMINqrJLrRacOk9x', // Aria
    model: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarityBoost: 0.75
  });

  const generateVoiceAnnouncement = async () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please add your ElevenLabs API key in settings first.',
        variant: 'destructive',
      });
      return;
    }

    if (!announcementText.trim()) {
      toast({
        title: 'Text Required',
        description: 'Please enter some text for the announcement.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsPlaying(true);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceSettings.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: announcementText,
          model_id: voiceSettings.model,
          voice_settings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarityBoost
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

      toast({
        title: 'Success',
        description: language === 'en' ? 'Announcement played successfully' : 'Pengumuman berjaya dimainkan',
      });

    } catch (error) {
      console.error('Error generating voice announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate voice announcement. Please check your API key and try again.',
        variant: 'destructive',
      });
      setIsPlaying(false);
    }
  };

  const stopAnnouncement = () => {
    // In a real implementation, you'd keep a reference to the audio element to stop it
    setIsPlaying(false);
  };

  const testVoice = async (voiceId: string) => {
    if (!apiKey) return;

    try {
      const testText = language === 'en' 
        ? 'This is a test of the community announcement system.' 
        : 'Ini adalah ujian sistem pengumuman komuniti.';

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: testText,
          model_id: voiceSettings.model,
          voice_settings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarityBoost
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error testing voice:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === 'en' ? 'Voice Announcements' : 'Pengumuman Suara'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Create and broadcast voice announcements to the community'
              : 'Cipta dan siarkan pengumuman suara kepada komuniti'
            }
          </p>
        </div>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Settings' : 'Tetapan'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Voice Settings' : 'Tetapan Suara'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' 
                  ? 'Configure your ElevenLabs API and voice settings'
                  : 'Konfigurasikan API ElevenLabs dan tetapan suara anda'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {language === 'en' ? 'ElevenLabs API Key' : 'Kunci API ElevenLabs'}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Get your API key from ElevenLabs dashboard'
                    : 'Dapatkan kunci API anda dari papan pemuka ElevenLabs'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'en' ? 'Voice' : 'Suara'}</Label>
                <Select value={voiceSettings.voiceId} onValueChange={(value) => 
                  setVoiceSettings(prev => ({ ...prev, voiceId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEVEN_LABS_VOICES.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{voice.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(voice.id);
                            }}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'en' ? 'Model' : 'Model'}</Label>
                <Select value={voiceSettings.model} onValueChange={(value) => 
                  setVoiceSettings(prev => ({ ...prev, model: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {language === 'en' ? 'Stability' : 'Kestabilan'}: {voiceSettings.stability}
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.stability}
                  onChange={(e) => setVoiceSettings(prev => ({ 
                    ...prev, 
                    stability: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {language === 'en' ? 'Similarity Boost' : 'Peningkatan Persamaan'}: {voiceSettings.similarityBoost}
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceSettings.similarityBoost}
                  onChange={(e) => setVoiceSettings(prev => ({ 
                    ...prev, 
                    similarityBoost: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Announcement Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Create Announcement' : 'Cipta Pengumuman'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Write your announcement text and convert it to speech'
              : 'Tulis teks pengumuman anda dan tukar kepada pertuturan'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement">
              {language === 'en' ? 'Announcement Text' : 'Teks Pengumuman'}
            </Label>
            <Textarea
              id="announcement"
              placeholder={
                language === 'en' 
                  ? 'Enter your announcement text here...'
                  : 'Masukkan teks pengumuman anda di sini...'
              }
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              {announcementText.length} {language === 'en' ? 'characters' : 'aksara'}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={generateVoiceAnnouncement}
              disabled={isPlaying || !announcementText.trim()}
              className="bg-gradient-primary"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Playing...' : 'Dimainkan...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Generate & Play' : 'Jana & Main'}
                </>
              )}
            </Button>

            {isPlaying && (
              <Button variant="outline" onClick={stopAnnouncement}>
                <Square className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Stop' : 'Henti'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Quick Announcements' : 'Pengumuman Pantas'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Pre-defined announcements for common situations'
              : 'Pengumuman yang telah ditetapkan untuk situasi biasa'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                type: 'emergency',
                title: language === 'en' ? 'Emergency Alert' : 'Amaran Kecemasan',
                text: language === 'en' 
                  ? 'This is an emergency announcement. Please follow evacuation procedures immediately.'
                  : 'Ini adalah pengumuman kecemasan. Sila ikut prosedur pemindahan segera.',
                icon: AlertTriangle,
                color: 'border-red-500'
              },
              {
                type: 'maintenance',
                title: language === 'en' ? 'Maintenance Notice' : 'Notis Penyelenggaraan',
                text: language === 'en' 
                  ? 'Scheduled maintenance will begin shortly. Please avoid affected areas.'
                  : 'Penyelenggaraan berjadual akan bermula tidak lama lagi. Sila elakkan kawasan yang terjejas.',
                icon: Settings,
                color: 'border-orange-500'
              },
              {
                type: 'event',
                title: language === 'en' ? 'Community Event' : 'Acara Komuniti',
                text: language === 'en' 
                  ? 'A community event is starting at the main hall. All residents are welcome.'
                  : 'Acara komuniti akan bermula di dewan utama. Semua penduduk dijemput.',
                icon: Mic,
                color: 'border-blue-500'
              }
            ].map((announcement) => (
              <Card key={announcement.type} className={`cursor-pointer hover:shadow-md transition-shadow ${announcement.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <announcement.icon className="w-5 h-5 mt-1 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-2">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{announcement.text}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAnnouncementText(announcement.text)}
                        className="w-full"
                      >
                        <Volume2 className="w-3 h-3 mr-2" />
                        {language === 'en' ? 'Use This' : 'Guna Ini'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
