import { useState, useEffect, useRef } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Hash, 
  Shield, 
  AlertTriangle, 
  Settings,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  message_type: 'text' | 'announcement' | 'alert' | 'system';
  profiles?: {
    display_name: string;
  };
}

interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  channel_type: 'general' | 'announcements' | 'emergency' | 'maintenance' | 'social';
  is_private: boolean;
  created_by: string;
  district_id: string;
  member_count: number;
}

export default function CommunityChat() {
  const { language, user, profile } = useEnhancedAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel);
      subscribeToMessages(currentChannel);
    }
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async () => {
    try {
      // For now, create mock channels since we don't have chat tables yet
      const mockChannels: ChatChannel[] = [
        {
          id: 'general',
          name: language === 'en' ? 'General' : 'Umum',
          description: language === 'en' ? 'General community discussions' : 'Perbincangan komuniti umum',
          channel_type: 'general',
          is_private: false,
          created_by: user?.id || '',
          district_id: 'district-1',
          member_count: 45
        },
        {
          id: 'announcements',
          name: language === 'en' ? 'Announcements' : 'Pengumuman',
          description: language === 'en' ? 'Official community announcements' : 'Pengumuman rasmi komuniti',
          channel_type: 'announcements',
          is_private: false,
          created_by: user?.id || '',
          district_id: 'district-1',
          member_count: 67
        },
        {
          id: 'maintenance',
          name: language === 'en' ? 'Maintenance' : 'Penyelenggaraan',
          description: language === 'en' ? 'Maintenance updates and schedules' : 'Kemas kini dan jadual penyelenggaraan',
          channel_type: 'maintenance',
          is_private: false,
          created_by: user?.id || '',
          district_id: 'district-1',
          member_count: 23
        },
        {
          id: 'social',
          name: language === 'en' ? 'Social' : 'Sosial',
          description: language === 'en' ? 'Casual conversations and social events' : 'Perbualan santai dan acara sosial',
          channel_type: 'social',
          is_private: false,
          created_by: user?.id || '',
          district_id: 'district-1',
          member_count: 34
        }
      ];

      setChannels(mockChannels);
      if (!currentChannel && mockChannels.length > 0) {
        setCurrentChannel(mockChannels[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat channels',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      // For now, create mock messages since we don't have chat tables yet
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          channel_id: channelId,
          user_id: 'user-1',
          message: language === 'en' 
            ? 'Good morning everyone! Hope you all have a great day.' 
            : 'Selamat pagi semua! Harap anda semua mempunyai hari yang hebat.',
          created_at: new Date(Date.now() - 60000 * 30).toISOString(),
          updated_at: new Date(Date.now() - 60000 * 30).toISOString(),
          message_type: 'text',
          profiles: {
            display_name: 'Ahmad Rahman'
          }
        },
        {
          id: '2',
          channel_id: channelId,
          user_id: 'user-2',
          message: language === 'en' 
            ? 'The swimming pool will be closed for maintenance from 2 PM to 4 PM today.' 
            : 'Kolam renang akan ditutup untuk penyelenggaraan dari 2 petang hingga 4 petang hari ini.',
          created_at: new Date(Date.now() - 60000 * 15).toISOString(),
          updated_at: new Date(Date.now() - 60000 * 15).toISOString(),
          message_type: channelId === 'announcements' ? 'announcement' : 'text',
          profiles: {
            display_name: 'Management Team'
          }
        },
        {
          id: '3',
          channel_id: channelId,
          user_id: 'user-3',
          message: language === 'en' 
            ? 'Thanks for the update! Is there an alternative pool available?' 
            : 'Terima kasih atas kemas kini! Adakah terdapat kolam alternatif yang tersedia?',
          created_at: new Date(Date.now() - 60000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 60000 * 5).toISOString(),
          message_type: 'text',
          profiles: {
            display_name: 'Sarah Lee'
          }
        }
      ];

      setMessages(mockMessages.filter(msg => msg.channel_id === channelId));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (channelId: string) => {
    // In a real implementation, this would set up real-time subscriptions
    // For now, we'll just simulate it
    return () => {
      // Cleanup subscription
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel) return;

    try {
      const messageData: ChatMessage = {
        id: Date.now().toString(),
        channel_id: currentChannel,
        user_id: user?.id || '',
        message: newMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_type: 'text',
        profiles: {
          display_name: profile?.full_name || user?.email?.split('@')[0] || 'You'
        }
      };

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');

      // In a real implementation, save to database here
      toast({
        title: 'Success',
        description: language === 'en' ? 'Message sent' : 'Mesej dihantar',
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'announcements': return MessageCircle;
      case 'emergency': return AlertTriangle;
      case 'maintenance': return Settings;
      case 'social': return Users;
      default: return Hash;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-500/10 border-blue-500/20';
      case 'alert': return 'bg-red-500/10 border-red-500/20';
      case 'system': return 'bg-gray-500/10 border-gray-500/20';
      default: return '';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return language === 'en' ? 'Just now' : 'Baru sahaja';
    if (diffInMinutes < 60) return `${diffInMinutes}${language === 'en' ? 'm ago' : 'm lalu'}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${language === 'en' ? 'h ago' : 'j lalu'}`;
    
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading chat...</div>;
  }

  return (
    <div className="flex h-[600px] bg-card rounded-lg border">
      {/* Sidebar - Channels */}
      <div className="w-64 border-r border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {language === 'en' ? 'Community Chat' : 'Chat Komuniti'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {channels.length} {language === 'en' ? 'channels' : 'saluran'}
          </p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {channels.map((channel) => {
              const IconComponent = getChannelIcon(channel.channel_type);
              return (
                <Button
                  key={channel.id}
                  variant={currentChannel === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentChannel(channel.id)}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{channel.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {channel.member_count}
                      </Badge>
                    </div>
                    {channel.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card/50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-foreground">
                {channels.find(c => c.id === currentChannel)?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {channels.find(c => c.id === currentChannel)?.member_count} {language === 'en' ? 'members' : 'ahli'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id} className="space-y-2">
                {index === 0 || new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString() && (
                  <div className="text-center">
                    <Separator />
                    <Badge variant="secondary" className="px-3 py-1">
                      {new Date(message.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY')}
                    </Badge>
                  </div>
                )}
                
                <div className={`flex items-start space-x-3 ${getMessageTypeColor(message.message_type)} p-3 rounded-lg`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {message.profiles?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {message.profiles?.display_name}
                      </span>
                      {message.message_type === 'announcement' && (
                        <Badge variant="secondary" className="text-xs">
                          {language === 'en' ? 'Announcement' : 'Pengumuman'}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-words">
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex space-x-2">
            <Input
              placeholder={
                language === 'en' 
                  ? 'Type your message...'
                  : 'Taip mesej anda...'
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
              className="bg-gradient-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'en' ? 'Press Enter to send, Shift+Enter for new line' : 'Tekan Enter untuk hantar, Shift+Enter untuk baris baru'}
          </p>
        </div>
      </div>
    </div>
  );
}