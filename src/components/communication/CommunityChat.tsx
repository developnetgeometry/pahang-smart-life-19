import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

interface MarketplaceChatInfo {
  chatWith?: string;
  presetMessage?: string;
  itemInfo?: {
    title: string;
    price: number;
    id: string;
  };
}

interface CommunityChatProps {
  marketplaceChat?: MarketplaceChatInfo | null;
}

export default function CommunityChat({ marketplaceChat }: CommunityChatProps = {}) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (marketplaceChat?.presetMessage) {
      setNewMessage(marketplaceChat.presetMessage);
      // Create a private chat channel for this conversation
      const privateChannelId = `dm_${user?.id}_${marketplaceChat.chatWith?.replace(/\s+/g, '_')}`;
      setCurrentChannel(privateChannelId);
      
      // Add private channel to channels if not exists
      setChannels(prev => {
        const existingChannel = prev.find(c => c.id === privateChannelId);
        if (!existingChannel) {
          const privateChannel: ChatChannel = {
            id: privateChannelId,
            name: `${marketplaceChat.chatWith}`,
            description: language === 'en' ? 'Private conversation' : 'Perbualan peribadi',
            channel_type: 'general', // Using general type but it's private
            is_private: true,
            created_by: user?.id || '',
            district_id: 'private',
            member_count: 2
          };
          return [privateChannel, ...prev];
        }
        return prev;
      });
    } else {
      fetchChannels();
    }
  }, [marketplaceChat, user, language]);

  useEffect(() => {
    if (!marketplaceChat) {
      fetchChannels();
    }
  }, [marketplaceChat]);

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
      // Check if this is a private marketplace chat
      if (channelId.startsWith('dm_') && marketplaceChat) {
        // Create mock private messages for marketplace chat
        const mockPrivateMessages: ChatMessage[] = [
          {
            id: 'welcome',
            channel_id: channelId,
            user_id: 'system',
            message: language === 'en' 
              ? `You are now chatting privately with ${marketplaceChat.chatWith} about "${marketplaceChat.itemInfo?.title}".`
              : `Anda kini berbual secara peribadi dengan ${marketplaceChat.chatWith} tentang "${marketplaceChat.itemInfo?.title}".`,
            created_at: new Date(Date.now() - 60000).toISOString(),
            updated_at: new Date(Date.now() - 60000).toISOString(),
            message_type: 'system',
            profiles: {
              display_name: 'System'
            }
          }
        ];
        setMessages(mockPrivateMessages);
        return;
      }

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
          display_name: user?.display_name || 'You'
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
    <div className="flex flex-col h-[600px] bg-card rounded-lg border">
      {/* Private Chat Header for Marketplace */}
      {marketplaceChat && currentChannel.startsWith('dm_') ? (
        <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {marketplaceChat.chatWith}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {language === 'en' ? 'Private conversation about:' : 'Perbualan peribadi tentang:'} {marketplaceChat.itemInfo?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {language === 'en' ? 'Private' : 'Peribadi'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                RM{marketplaceChat.itemInfo?.price}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        // Regular Channel Header
        <div className="p-4 border-b border-border bg-card/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">
              {language === 'en' ? 'Community Chat' : 'Chat Komuniti'}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {channels.find(c => c.id === currentChannel)?.member_count} {language === 'en' ? 'members' : 'ahli'}
            </Badge>
          </div>
          
          {/* Channel Tabs */}
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => {
              const IconComponent = getChannelIcon(channel.channel_type);
              return (
                <Button
                  key={channel.id}
                  variant={currentChannel === channel.id ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setCurrentChannel(channel.id)}
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="text-xs">{channel.name}</span>
                  {!channel.is_private && (
                    <Badge variant="secondary" className="text-xs ml-1">
                      {channel.member_count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

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
        {marketplaceChat && currentChannel.startsWith('dm_') && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {language === 'en' 
                ? `💬 This is a private conversation with ${marketplaceChat.chatWith} about your marketplace inquiry.`
                : `💬 Ini adalah perbualan peribadi dengan ${marketplaceChat.chatWith} tentang pertanyaan marketplace anda.`
              }
            </p>
          </div>
        )}
        <div className="flex space-x-2">
          <Input
            placeholder={
              marketplaceChat && currentChannel.startsWith('dm_')
                ? (language === 'en' ? 'Your message is ready to send...' : 'Mesej anda sedia untuk dihantar...')
                : (language === 'en' ? 'Type your message...' : 'Taip mesej anda...')
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
  );
}