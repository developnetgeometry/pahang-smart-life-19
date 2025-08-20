import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Volume2, 
  Bell, 
  Users, 
  Phone, 
  Video,
  Megaphone,
  Shield,
  Settings,
  Activity
} from 'lucide-react';
import VoiceAnnouncement from '@/components/communication/VoiceAnnouncement';
import CommunityChat from '@/components/communication/CommunityChat';

export default function CommunicationHub() {
  const { language } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('chat');

  // Check if navigated from marketplace with seller chat info
  const marketplaceChat = location.state as {
    chatWith?: string;
    presetMessage?: string;
    itemInfo?: {
      title: string;
      price: number;
      id: string;
    };
  } | null;

  const communicationStats = {
    activeUsers: 34,
    unreadMessages: 12,
    onlineNow: 8,
    todayAnnouncements: 3
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Communication Hub' : 'Pusat Komunikasi'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Real-time communication and community engagement'
              : 'Komunikasi masa nyata dan penglibatan komuniti'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            {communicationStats.onlineNow} {language === 'en' ? 'online' : 'dalam talian'}
          </Badge>
        </div>
      </div>

      {/* Marketplace Chat Notification */}
      {marketplaceChat && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {language === 'en' ? 'Marketplace Chat' : 'Chat Marketplace'}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">
                  {language === 'en' 
                    ? `Starting chat with ${marketplaceChat.chatWith} about "${marketplaceChat.itemInfo?.title}"`
                    : `Memulakan chat dengan ${marketplaceChat.chatWith} tentang "${marketplaceChat.itemInfo?.title}"`
                  }
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300">
                  <span>
                    {language === 'en' ? 'Price:' : 'Harga:'} RM{marketplaceChat.itemInfo?.price}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {language === 'en' ? 'Marketplace Item' : 'Item Marketplace'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Active Users' : 'Pengguna Aktif'}
                </p>
                <p className="text-2xl font-bold">{communicationStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Unread Messages' : 'Mesej Belum Dibaca'}
                </p>
                <p className="text-2xl font-bold">{communicationStats.unreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Online Now' : 'Dalam Talian Sekarang'}
                </p>
                <p className="text-2xl font-bold">{communicationStats.onlineNow}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Volume2 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Today Announcements' : 'Pengumuman Hari Ini'}
                </p>
                <p className="text-2xl font-bold">{communicationStats.todayAnnouncements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Communication Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Communication Tools' : 'Alat Komunikasi'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Choose your communication method'
              : 'Pilih kaedah komunikasi anda'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'en' ? 'Chat' : 'Chat'}</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>{language === 'en' ? 'Voice' : 'Suara'}</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>{language === 'en' ? 'Video' : 'Video'}</span>
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4" />
                <span>{language === 'en' ? 'Broadcast' : 'Siaran'}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <CommunityChat marketplaceChat={marketplaceChat} />
            </TabsContent>

            <TabsContent value="voice" className="mt-6">
              <VoiceAnnouncement />
            </TabsContent>

            <TabsContent value="video" className="mt-6">
              <div className="text-center py-12">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'en' ? 'Video Calls' : 'Panggilan Video'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'en' 
                    ? 'Video calling features coming soon!'
                    : 'Ciri panggilan video akan datang tidak lama lagi!'
                  }
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Audio Call' : 'Panggilan Audio'}
                  </Button>
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Video Call' : 'Panggilan Video'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="broadcast" className="mt-6">
              <div className="space-y-6">
                {/* Emergency Broadcast */}
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <Shield className="w-5 h-5 mr-2" />
                      {language === 'en' ? 'Emergency Broadcast' : 'Siaran Kecemasan'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'en' 
                        ? 'Send urgent notifications to all residents'
                        : 'Hantar notifikasi segera kepada semua penduduk'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Send Emergency Alert' : 'Hantar Amaran Kecemasan'}
                    </Button>
                  </CardContent>
                </Card>

                {/* General Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Megaphone className="w-5 h-5 mr-2" />
                      {language === 'en' ? 'Community Announcements' : 'Pengumuman Komuniti'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'en' 
                        ? 'Broadcast messages to specific groups or all residents'
                        : 'Siarkan mesej kepada kumpulan tertentu atau semua penduduk'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'All Residents' : 'Semua Penduduk'}
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Security Team' : 'Pasukan Keselamatan'}
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Maintenance' : 'Penyelenggaraan'}
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Management' : 'Pengurusan'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">
              {language === 'en' ? 'Start Group Chat' : 'Mulakan Chat Kumpulan'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Create a new chat room for specific topics'
                : 'Cipta bilik chat baru untuk topik tertentu'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Volume2 className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">
              {language === 'en' ? 'Record Announcement' : 'Rakam Pengumuman'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Record a voice message for the community'
                : 'Rakam mesej suara untuk komuniti'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Bell className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">
              {language === 'en' ? 'Schedule Notification' : 'Jadual Notifikasi'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Set up automated notifications and reminders'
                : 'Sediakan notifikasi dan peringatan automatik'
              }
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
}