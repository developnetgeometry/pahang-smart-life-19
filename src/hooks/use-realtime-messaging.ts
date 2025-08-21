import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface EnhancedMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'system';
  created_at: string;
  edited_at?: string;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to_id?: string;
  reactions?: MessageReaction[];
  read_by?: string[];
  file_url?: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  thread_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface TypingUser {
  user_id: string;
  user_name: string;
  room_id: string;
  started_at: string;
}

export const useRealtimeMessaging = (roomId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  // Fetch messages with pagination
  const fetchMessages = useCallback(async (offset = 0, limit = 50) => {
    if (!roomId || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          room_id,
          sender_id,
          message_text,
          message_type,
          created_at,
          edited_at,
          is_edited,
          is_deleted,
          reply_to_id,
          file_url,
          profiles:sender_id (
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const enhancedMessages: EnhancedMessage[] = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'file' | 'voice' | 'system',
        sender_profile: {
          full_name: msg.profiles?.full_name || 'Unknown User',
          avatar_url: msg.profiles?.avatar_url
        },
        reactions: [],
        read_by: [],
        thread_count: 0
      }));

      if (offset === 0) {
        setMessages(enhancedMessages.reverse());
      } else {
        setMessages(prev => [...enhancedMessages.reverse(), ...prev]);
      }

      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [roomId, user, toast]);

  // Typing indicators
  const stopTyping = useCallback(async () => {
    if (!roomId || !user) return;

    try {
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', user.id)
        .eq('room_id', roomId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [roomId, user]);

  const startTyping = useCallback(async () => {
    if (!roomId || !user) return;

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          user_id: user.id,
          room_id: roomId,
          started_at: new Date().toISOString(),
        });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(stopTyping, 3000);
    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }, [roomId, user, stopTyping]);

  // Send message with notification support
  const sendMessage = useCallback(async (
    messageText: string,
    messageType: 'text' | 'image' | 'file' | 'voice' = 'text',
    fileData?: { url: string },
    replyToId?: string,
    notificationOptions?: {
      isMarketplaceChat?: boolean;
      recipientIds?: string[];
    }
  ) => {
    if (!roomId || !user || !messageText.trim()) return;

    try {
      const messageData = {
        room_id: roomId,
        sender_id: user.id,
        message_text: messageText,
        message_type: messageType,
        file_url: fileData?.url,
        reply_to_id: replyToId,
        is_edited: false,
        is_deleted: false,
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select(`
          *,
          profiles:sender_id (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Add the message to local state immediately for better UX
      const enhancedMessage: EnhancedMessage = {
        ...data,
        message_type: data.message_type as 'text' | 'image' | 'file' | 'voice' | 'system',
        sender_profile: {
          full_name: data.profiles?.full_name || user.email || 'You',
          avatar_url: data.profiles?.avatar_url
        },
        reactions: [],
        read_by: [],
        thread_count: 0
      };

      setMessages(prev => [...prev, enhancedMessage]);

      // Stop typing indicator
      stopTyping();

      // Send notifications to other room members if specified
      if (notificationOptions?.recipientIds) {
        const senderName = data.profiles?.full_name || user.email || 'Someone';
        const messagePreview = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText;
        
        // Send notification via edge function
        await supabase.functions.invoke('send-push-notification', {
          body: {
            title: notificationOptions.isMarketplaceChat 
              ? `New message about your product` 
              : `New message from ${senderName}`,
            body: `${senderName}: ${messagePreview}`,
            url: `/communication-hub?room=${roomId}`,
            userIds: notificationOptions.recipientIds,
            notificationType: 'message'
          }
        });

        // Store notification in database
        const notifications = notificationOptions.recipientIds.map(recipientId => ({
          recipient_id: recipientId,
          title: notificationOptions.isMarketplaceChat 
            ? `New message about your product` 
            : `New message from ${senderName}`,
          message: `${senderName}: ${messagePreview}`,
          notification_type: 'message',
          category: 'message',
          created_by: user.id,
          is_read: false,
          sent_at: new Date().toISOString(),
        }));

        await supabase.from('notifications').insert(notifications);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [roomId, user, toast, stopTyping]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          message_text: newText,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message updated successfully',
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit message',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // React to message (simplified for demo)
  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;
    // This would normally update the database
    console.log('Reacting to message:', messageId, 'with:', emoji);
  }, [user]);

  // Mark messages as read (simplified for demo)
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;
    // This would normally update a message_reads table
    console.log('Marking messages as read:', messageIds);
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Only add messages from other users (our own messages are added immediately in sendMessage)
          if (newMessage.sender_id !== user?.id) {
            // Fetch the complete message with profile info
            const { data: messageWithProfile } = await supabase
              .from('chat_messages')
              .select(`
                *,
                profiles:sender_id (
                  full_name,
                  avatar_url
                )
              `)
              .eq('id', newMessage.id)
              .single();

            if (messageWithProfile) {
              const enhancedMessage: EnhancedMessage = {
                ...messageWithProfile,
                message_type: messageWithProfile.message_type as 'text' | 'image' | 'file' | 'voice' | 'system',
                sender_profile: {
                  full_name: messageWithProfile.profiles?.full_name || 'Unknown User',
                  avatar_url: messageWithProfile.profiles?.avatar_url
                },
                reactions: [],
                read_by: [],
                thread_count: 0
              };

              setMessages(prev => [...prev, enhancedMessage]);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as EnhancedMessage;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`room-typing-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // For demo, simulate typing users
          setTypingUsers([]);
        }
      )
      .subscribe();

    channelRef.current = { messagesChannel, typingChannel };

    // Cleanup old typing indicators on mount
    supabase.rpc('cleanup_old_typing_indicators');

    return () => {
      messagesChannel.unsubscribe();
      typingChannel.unsubscribe();
    };
  }, [roomId, user?.id]);

  // Load messages on room change
  useEffect(() => {
    if (roomId) {
      fetchMessages(0);
    }
  }, [roomId, fetchMessages]);

  return {
    messages,
    typingUsers,
    isLoading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    startTyping,
    stopTyping,
    markAsRead,
    fetchMessages,
  };
};