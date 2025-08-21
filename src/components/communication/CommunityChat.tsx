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

interface DirectMessage {
  id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  avatar?: string;
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
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [showChatList, setShowChatList] = useState(false);
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
      setLoading(false); // Set loading to false for marketplace chat
    } else {
      fetchChannels();
    }
  }, [marketplaceChat, user, language]);

  useEffect(() => {
    // Always fetch channels on component mount, regardless of marketplace chat
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
      
      // Fetch direct messages for the social tab
      fetchDirectMessages();
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

  const fetchDirectMessages = async () => {
    try {
      // Fetch direct message rooms for the current user
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          name,
          created_at,
          updated_at,
          room_type,
          is_private,
          chat_messages!inner (
            message_text,
            created_at,
            sender_id
          )
        `)
        .eq('room_type', 'direct')
        .eq('is_private', true)
        .or(`created_by.eq.${user?.id},name.like.%${user?.id}%`)
        .order('updated_at', { ascending: false });

      if (roomsError) {
        console.error('Error fetching direct messages:', roomsError);
      }

      let directMessages: DirectMessage[] = [];

      if (rooms && rooms.length > 0) {
        // Transform the data into the DirectMessage format
        directMessages = rooms.map(room => {
          const lastMessage = room.chat_messages?.[0];
          const otherUserName = room.name
            .split('_')
            .find(part => part !== user?.id?.replace(/-/g, '')) || 'Unknown User';
          
          return {
            id: room.id,
            other_user_name: otherUserName,
            last_message: lastMessage?.message_text || 'No messages yet',
            last_message_time: lastMessage?.created_at || room.created_at,
            unread_count: 0, // TODO: Implement unread count logic
            avatar: otherUserName.split(' ').map(n => n[0]).join('').toUpperCase()
          };
        });
      } else {
        // Show demo data when no real conversations exist
        directMessages = [
          {
            id: 'demo_sarah_123',
            other_user_name: 'Sarah Lee',
            last_message: language === 'en' 
              ? 'Thanks for helping with the pool booking!' 
              : 'Terima kasih kerana membantu dengan tempahan kolam!',
            last_message_time: new Date(Date.now() - 60000 * 15).toISOString(),
            unread_count: 2,
            avatar: 'SL'
          },
          {
            id: 'demo_ahmad_456',
            other_user_name: 'Ahmad Rahman',
            last_message: language === 'en' 
              ? 'The maintenance is scheduled for tomorrow' 
              : 'Penyelenggaraan dijadualkan untuk esok',
            last_message_time: new Date(Date.now() - 60000 * 45).toISOString(),
            unread_count: 0,
            avatar: 'AR'
          },
          {
            id: 'demo_maria_789',
            other_user_name: 'Maria Santos',
            last_message: language === 'en' 
              ? 'Let me know when you\'re free to chat' 
              : 'Beritahu saya apabila anda bebas untuk berbual',
            last_message_time: new Date(Date.now() - 60000 * 120).toISOString(),
            unread_count: 1,
            avatar: 'MS'
          }
        ];
      }
      
      setDirectMessages(directMessages);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      // Fallback to demo data on error
      const demoData: DirectMessage[] = [
        {
          id: 'demo_sarah_123',
          other_user_name: 'Sarah Lee',
          last_message: language === 'en' 
            ? 'Thanks for helping with the pool booking!' 
            : 'Terima kasih kerana membantu dengan tempahan kolam!',
          last_message_time: new Date(Date.now() - 60000 * 15).toISOString(),
          unread_count: 2,
          avatar: 'SL'
        },
        {
          id: 'demo_ahmad_456',
          other_user_name: 'Ahmad Rahman',
          last_message: language === 'en' 
            ? 'The maintenance is scheduled for tomorrow' 
            : 'Penyelenggaraan dijadualkan untuk esok',
          last_message_time: new Date(Date.now() - 60000 * 45).toISOString(),
          unread_count: 0,
          avatar: 'AR'
        },
        {
          id: 'demo_maria_789',
          other_user_name: 'Maria Santos',
          last_message: language === 'en' 
            ? 'Let me know when you\'re free to chat' 
            : 'Beritahu saya apabila anda bebas untuk berbual',
          last_message_time: new Date(Date.now() - 60000 * 120).toISOString(),
          unread_count: 1,
          avatar: 'MS'
        }
      ];
      setDirectMessages(demoData);
    }
  };

  const handleSocialTabClick = () => {
    if (currentChannel === 'social') {
      setShowChatList(!showChatList);
    } else {
      setCurrentChannel('social');
      setShowChatList(true);
    }
  };

  const openDirectMessage = async (dmId: string, userName: string) => {
    setCurrentChannel(dmId);
    setShowChatList(false);
    fetchMessages(dmId);
  };

  const createOrFindDirectMessageRoom = async (otherUserId: string, otherUserName: string) => {
    try {
      // First, try to find an existing room between these two users
      const roomName = [user?.id, otherUserId].sort().join('_');
      
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('room_type', 'direct')
        .eq('is_private', true)
        .eq('name', roomName)
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error finding existing room:', findError);
        return null;
      }

      if (existingRoom) {
        return existingRoom.id;
      }

      // Create new room if it doesn't exist
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          name: roomName,
          room_type: 'direct',
          is_private: true,
          created_by: user?.id,
          district_id: null, // Direct messages are not district-specific
          description: `Direct message between users`,
          max_members: 2
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating new room:', createError);
        toast({
          title: 'Error',
          description: 'Failed to create chat room',
          variant: 'destructive',
        });
        return null;
      }

      return newRoom.id;
    } catch (error) {
      console.error('Error in createOrFindDirectMessageRoom:', error);
      return null;
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

      // Check if this is a direct message room (from the social tab or demo)
      if (channelId.length === 36 || channelId.startsWith('demo_')) { 
        // Handle demo direct messages
        if (channelId.startsWith('demo_')) {
          const userName = directMessages.find(dm => dm.id === channelId)?.other_user_name || 'Unknown User';
          const mockDirectMessages: ChatMessage[] = [
            {
              id: 'dm_welcome',
              channel_id: channelId,
              user_id: 'system',
              message: language === 'en' 
                ? `You are now chatting with ${userName}. This is a private conversation.`
                : `Anda kini berbual dengan ${userName}. Ini adalah perbualan peribadi.`,
              created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
              updated_at: new Date(Date.now() - 300000).toISOString(),
              message_type: 'system',
              profiles: {
                display_name: 'System'
              }
            },
            {
              id: 'dm_1',
              channel_id: channelId,
              user_id: 'other_user',
              message: directMessages.find(dm => dm.id === channelId)?.last_message || 
                (language === 'en' ? 'Hello! How are you?' : 'Helo! Apa khabar?'),
              created_at: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
              updated_at: new Date(Date.now() - 180000).toISOString(),
              message_type: 'text',
              profiles: {
                display_name: userName
              }
            },
            {
              id: 'dm_2',
              channel_id: channelId,
              user_id: user?.id || 'current_user',
              message: language === 'en' ? 'Hi there! I\'m doing well, thanks for asking!' : 'Hai! Saya sihat, terima kasih kerana bertanya!',
              created_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
              updated_at: new Date(Date.now() - 60000).toISOString(),
              message_type: 'text',
              profiles: {
                display_name: 'You'
              }
            }
          ];
          setMessages(mockDirectMessages);
          return;
        }

        // Handle real UUID direct message rooms
        const { data: messages, error } = await supabase
          .from('chat_messages')
          .select(`
            id,
            message_text,
            created_at,
            sender_id,
            message_type
          `)
          .eq('room_id', channelId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        // Fetch profiles for all unique sender IDs
        const senderIds = [...new Set(messages?.map(m => m.sender_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds);

        // Create a map of user IDs to names
        const profileMap = new Map(
          profiles?.map(p => [p.id, p.full_name]) || []
        );

        const formattedMessages: ChatMessage[] = (messages || []).map(msg => ({
          id: msg.id,
          channel_id: channelId,
          user_id: msg.sender_id,
          message: msg.message_text,
          created_at: msg.created_at,
          updated_at: msg.created_at,
          message_type: msg.message_type as 'text' | 'announcement' | 'alert' | 'system',
          profiles: {
            display_name: profileMap.get(msg.sender_id) || 'Unknown User'
          }
        }));

        setMessages(formattedMessages);
        return;
      }

      // For other channels (general, announcements, etc.) - keep mock data
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
    // Only set up real-time subscriptions for actual chat rooms (UUID format)
    if (channelId.length !== 36) {
      return () => {};
    }

    const channel = supabase
      .channel(`room_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${channelId}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data: newMessage } = await supabase
            .from('chat_messages')
            .select(`
              id,
              message_text,
              created_at,
              sender_id,
              message_type
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage && newMessage.sender_id !== user?.id) {
            // Get profile data separately
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newMessage.sender_id)
              .single();

            // Only add if it's not from the current user (to avoid duplicates)
            const formattedMessage: ChatMessage = {
              id: newMessage.id,
              channel_id: channelId,
              user_id: newMessage.sender_id,
              message: newMessage.message_text,
              created_at: newMessage.created_at,
              updated_at: newMessage.created_at,
              message_type: newMessage.message_type as 'text' | 'announcement' | 'alert' | 'system',
              profiles: {
                display_name: profile?.full_name || 'Unknown User'
              }
            };

            setMessages(prev => [...prev, formattedMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel) return;

    try {
      // For direct message rooms (UUID format), save to database
      if (currentChannel.length === 36) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            room_id: currentChannel,
            sender_id: user?.id,
            message_text: newMessage,
            message_type: 'text'
          })
          .select(`
            id,
            message_text,
            created_at,
            sender_id,
            message_type
          `)
          .single();

        if (error) {
          console.error('Error saving message:', error);
          toast({
            title: 'Error',
            description: 'Failed to send message',
            variant: 'destructive',
          });
          return;
        }

        // Get the profile data separately
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user?.id)
          .single();

        // Add the new message to the local state
        const newMessageData: ChatMessage = {
          id: data.id,
          channel_id: currentChannel,
          user_id: data.sender_id,
          message: data.message_text,
          created_at: data.created_at,
          updated_at: data.created_at,
          message_type: data.message_type as 'text' | 'announcement' | 'alert' | 'system',
          profiles: {
            display_name: profile?.full_name || 'You'
          }
        };

        setMessages(prev => [...prev, newMessageData]);

        // Update the room's updated_at timestamp
        await supabase
          .from('chat_rooms')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentChannel);

        // Refresh direct messages list to show updated timestamp
        fetchDirectMessages();
      } else {
        // For other channels, use mock behavior for now
        const messageData: ChatMessage = {
          id: Date.now().toString(),
          channel_id: currentChannel,
          user_id: user?.id || '',
          message: newMessage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_type: 'text',
          profiles: {
            display_name: 'You'
          }
        };

        setMessages(prev => [...prev, messageData]);
      }

      setNewMessage('');

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
                   onClick={() => channel.id === 'social' ? handleSocialTabClick() : setCurrentChannel(channel.id)}
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

      {/* Messages or Chat List */}
      {currentChannel === 'social' && showChatList ? (
        // WhatsApp-style chat list
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              {language === 'en' ? 'Your Conversations' : 'Perbualan Anda'}
            </h4>
            <div className="space-y-2">
              {directMessages.map((dm) => (
                <div
                  key={dm.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openDirectMessage(dm.id, dm.other_user_name)}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-sm">
                      {dm.avatar || dm.other_user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground truncate">
                        {dm.other_user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(dm.last_message_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {dm.last_message}
                      </p>
                      {dm.unread_count > 0 && (
                        <Badge variant="default" className="text-xs min-w-[20px] h-5 rounded-full">
                          {dm.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      ) : (
        // Regular Messages
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
      )}

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