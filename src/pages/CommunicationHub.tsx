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
  Bell, 
  Users, 
  Phone, 
  Video,
  Activity,
  Settings
} from 'lucide-react';
import CommunityChat from '@/components/communication/CommunityChat';
import { useCommunicationStats } from '@/hooks/use-communication-stats';
import { useUserPresence } from '@/hooks/use-user-presence';
import VideoCallRoom from '@/components/communication/VideoCallRoom';
import SmartNotifications from '@/components/communication/SmartNotifications';
import NotificationCenter from '@/components/communication/NotificationCenter';

export default function CommunicationHub() {
  const { language } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('chat');
  const [showNotifications, setShowNotifications] = useState(false);

  // Real-time hooks
  const { stats: communicationStats, isLoading: statsLoading } = useCommunicationStats();
  const { onlineUsers, updatePresence } = useUserPresence();

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
              {onlineUsers.length} {language === 'en' ? 'online' : 'dalam talian'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Settings' : 'Tetapan'}
            </Button>
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

        {/* Notification Settings */}
        {showNotifications && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Smart Notifications' : 'Notifikasi Pintar'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartNotifications />
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
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : communicationStats?.activeUsers || 0}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : communicationStats?.unreadMessages || 0}
                  </p>
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
                  <p className="text-2xl font-bold">{onlineUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Today Announcements' : 'Pengumuman Hari Ini'}
                  </p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : communicationStats?.todayAnnouncements || 0}
                  </p>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{language === 'en' ? 'Chat' : 'Chat'}</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>{language === 'en' ? 'Video' : 'Video'}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-6">
                <CommunityChat marketplaceChat={marketplaceChat} />
              </TabsContent>

              <TabsContent value="video" className="mt-6">
                <VideoCallRoom 
                  roomId="community-video-call"
                  isHost={true}
                  onLeave={() => setActiveTab('chat')}
                  onToggleChat={() => setActiveTab('chat')}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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