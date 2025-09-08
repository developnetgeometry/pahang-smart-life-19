import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserPresence } from '@/hooks/use-user-presence';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Wifi, WifiOff } from 'lucide-react';

interface OnlineUser {
  id: string;
  display_name: string;
  status: 'online' | 'away' | 'busy';
  last_seen: string;
}

interface RealTimePresenceIndicatorProps {
  roomId?: string;
  showList?: boolean;
  maxUsers?: number;
}

export default function RealTimePresenceIndicator({ 
  roomId, 
  showList = true, 
  maxUsers = 5 
}: RealTimePresenceIndicatorProps) {
  const { language } = useAuth();
  const { onlineUsers, isLoading, updatePresence } = useUserPresence();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online');
      updatePresence('online');
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
      updatePresence('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updatePresence]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return language === 'en' ? 'Online' : 'Dalam Talian';
      case 'away': return language === 'en' ? 'Away' : 'Tidak Ada';
      case 'busy': return language === 'en' ? 'Busy' : 'Sibuk';
      default: return language === 'en' ? 'Offline' : 'Luar Talian';
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return language === 'en' ? 'Just now' : 'Baru sahaja';
    if (diffMins < 60) return language === 'en' ? `${diffMins}m ago` : `${diffMins}m lalu`;
    return language === 'en' ? `${diffHours}h ago` : `${diffHours}j lalu`;
  };

  const displayUsers = showList ? onlineUsers.slice(0, maxUsers) : [];
  const remainingCount = Math.max(0, onlineUsers.length - maxUsers);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4 animate-pulse" />
        <span className="text-sm">
          {language === 'en' ? 'Loading...' : 'Memuatkan...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connection Status & Online Count */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/50 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="relative">
            {connectionStatus === 'online' ? (
              <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            {connectionStatus === 'online' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            )}
          </div>
          <Badge variant="outline" className="flex items-center gap-2 bg-background/80 backdrop-blur-sm hover-scale">
            <Users className="w-3 h-3" />
            <span className="font-semibold">{onlineUsers.length}</span>
            <span className="text-xs">{language === 'en' ? 'online' : 'dalam talian'}</span>
          </Badge>
        </div>
        
        <Badge 
          variant={connectionStatus === 'online' ? 'default' : 'destructive'}
          className={`text-xs font-medium px-3 py-1 ${
            connectionStatus === 'online' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 animate-pulse' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
        >
          {connectionStatus === 'online' 
            ? (language === 'en' ? 'Connected' : 'Disambung')
            : (language === 'en' ? 'Disconnected' : 'Terputus')
          }
        </Badge>
      </div>

      {/* Online Users List */}
      {showList && (
        <div className="space-y-2">
          {displayUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {language === 'en' ? 'No users online' : 'Tiada pengguna dalam talian'}
            </div>
          ) : (
            <>
              {displayUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 cursor-pointer group animate-fade-in hover-scale border border-transparent hover:border-border/30"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:shadow-lg transition-shadow">
                      <AvatarFallback className="text-sm bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                        {user.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(user.status)} ${
                        user.status === 'online' ? 'animate-pulse' : ''
                      }`}
                      title={getStatusText(user.status)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {user.display_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {user.status === 'online' 
                          ? getStatusText(user.status)
                          : formatLastSeen(user.last_seen)
                        }
                      </p>
                      {user.status === 'online' && (
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {remainingCount > 0 && (
                <div className="text-center py-2">
                  <Badge variant="secondary" className="text-xs">
                    +{remainingCount} {language === 'en' ? 'more' : 'lagi'}
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}