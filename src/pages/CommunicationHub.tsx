import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Bell, 
  Users,
  Activity,
  Settings
} from 'lucide-react';
import CommunityChat from '@/components/communication/CommunityChat';
import { useCommunicationStats } from '@/hooks/use-communication-stats';
import { useUserPresence } from '@/hooks/use-user-presence';
import RealTimePresenceIndicator from '@/components/communication/RealTimePresenceIndicator';
import { NotificationTest } from '@/components/communication/NotificationTest';

import SmartNotifications from '@/components/communication/SmartNotifications';
import NotificationCenter from '@/components/communication/NotificationCenter';

export default function CommunicationHub() {
  const { language } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Real-time hooks
  const { stats: communicationStats, isLoading: statsLoading } = useCommunicationStats();
  const { onlineUsers, updatePresence } = useUserPresence();

  // Check if navigated from marketplace or directory with chat info
  const locationState = location.state as {
    chatWith?: string;
    presetMessage?: string;
    itemInfo?: {
      title: string;
      price: number;
      id: string;
    };
    directoryChat?: {
      contactId: string;
      contactName: string;
      contactTitle: string;
    };
  } | null;

  const marketplaceChat = locationState && locationState.itemInfo ? {
    chatWith: locationState.chatWith,
    presetMessage: locationState.presetMessage,
    itemInfo: locationState.itemInfo
  } : null;

  const directoryChat = locationState?.directoryChat;

  return (
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

        {/* Directory Chat Notification */}
        {directoryChat && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    {language === 'en' ? 'Directory Contact' : 'Kenalan Direktori'}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-200 mb-2">
                    {language === 'en' 
                      ? `Starting chat with ${directoryChat.contactName}`
                      : `Memulakan chat dengan ${directoryChat.contactName}`
                    }
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-300">
                    <span>{directoryChat.contactTitle}</span>
                    <Badge variant="secondary" className="text-xs">
                      {language === 'en' ? 'Directory Contact' : 'Kenalan Direktori'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Presence Indicator */}
        <Card className="border-border/50 bg-gradient-to-br from-background via-muted/10 to-background shadow-lg backdrop-blur-sm animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-b border-border/30">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
                {language === 'en' ? "Who's Online" : 'Siapa Dalam Talian'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <RealTimePresenceIndicator showList={true} maxUsers={8} />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        {showNotifications && (
          <div className="grid gap-4 md:grid-cols-2">
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
            
            <NotificationTest />
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in"
             style={{ animationDelay: '0.2s' }}>
          <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-600/10 hover:shadow-lg transition-all duration-300 hover-scale cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl shadow-sm">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    {language === 'en' ? 'Active Users' : 'Pengguna Aktif'}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      communicationStats?.activeUsers || 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-green-600/10 hover:shadow-lg transition-all duration-300 hover-scale cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-xl shadow-sm">
                  <Bell className="w-6 h-6 text-green-600 animate-pulse" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    {language === 'en' ? 'Unread Messages' : 'Mesej Belum Dibaca'}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      communicationStats?.unreadMessages || 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-600/10 hover:shadow-lg transition-all duration-300 hover-scale cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl shadow-sm relative">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    {language === 'en' ? 'Online Now' : 'Dalam Talian Sekarang'}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    {onlineUsers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-orange-500/5 to-orange-600/10 hover:shadow-lg transition-all duration-300 hover-scale cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-xl shadow-sm">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    {language === 'en' ? "Today's Announcements" : 'Pengumuman Hari Ini'}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    {statsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      communicationStats?.todayAnnouncements || 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Communication Interface */}
        <Card className="border-border/50 bg-gradient-to-br from-background via-muted/5 to-background shadow-xl backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: '0.4s' }}>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-b border-border/30">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
                {language === 'en' ? 'Communication Tools' : 'Alat Komunikasi'}
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {language === 'en' 
                ? 'Connect, chat, and collaborate with your community'
                : 'Berhubung, bersembang, dan bekerjasama dengan komuniti anda'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <CommunityChat marketplaceChat={marketplaceChat} directoryChat={directoryChat} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
             style={{ animationDelay: '0.6s' }}>
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover-scale bg-gradient-to-br from-background to-primary/5 border-border/50 backdrop-blur-sm group">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mx-auto w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold mb-3 text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {language === 'en' ? 'Start New Chat' : 'Mulakan Chat Baru'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'en' 
                  ? 'Connect with community members directly and build stronger relationships'
                  : 'Berhubung dengan ahli komuniti secara langsung dan bina hubungan yang kuat'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover-scale bg-gradient-to-br from-background to-secondary/5 border-border/50 backdrop-blur-sm group">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl mx-auto w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-bold mb-3 text-lg bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {language === 'en' ? 'Smart Notifications' : 'Notifikasi Pintar'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'en' 
                  ? 'Set up intelligent notifications and never miss important updates'
                  : 'Sediakan notifikasi pintar dan jangan terlepas kemas kini penting'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}