import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  last_message?: {
    text: string;
    sender_name: string;
    created_at: string;
  };
}

interface ChatMember {
  id: string;
  user_id: string;
  is_admin: boolean;
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useChatRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    if (!user?.id) return;

    try {
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members!inner(user_id),
          chat_messages(
            message_text,
            created_at,
            sender_id,
            profiles(full_name)
          )
        `)
        .eq('chat_room_members.user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedRooms = roomsData?.map(room => ({
        ...room,
        member_count: room.chat_room_members?.length || 0,
        last_message: room.chat_messages?.[0] ? {
          text: room.chat_messages[0].message_text,
          sender_name: room.chat_messages[0].profiles?.full_name || 'Unknown',
          created_at: room.chat_messages[0].created_at
        } : undefined
      })) || [];

      setRooms(processedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (otherUserId: string) => {
    try {
      const { data, error } = await supabase.rpc('create_direct_chat', {
        other_user_id: otherUserId
      });

      if (error) throw error;
      
      await fetchRooms();
      return data;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  };

  const createGroupChat = async (name: string, description: string, memberIds: string[]) => {
    try {
      // Create the group chat room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          room_type: 'group',
          is_private: true,
          created_by: user?.id,
          max_members: 100
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add the creator and selected members
      const members = [
        { room_id: roomData.id, user_id: user?.id, is_admin: true },
        ...memberIds.map(userId => ({ room_id: roomData.id, user_id: userId, is_admin: false }))
      ];

      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert(members);

      if (membersError) throw membersError;

      await fetchRooms();
      return roomData.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  };

  const getRoomMembers = async (roomId: string): Promise<ChatMember[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_room_members')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('room_id', roomId);

      if (error) throw error;

      return data.map(member => ({
        ...member,
        profile: member.profiles
      })) as ChatMember[];
    } catch (error) {
      console.error('Error fetching room members:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchRooms();

    // Subscribe to real-time updates for chat rooms
    const channel = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms'
      }, () => {
        fetchRooms();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_room_members'
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    rooms,
    loading,
    fetchRooms,
    createDirectChat,
    createGroupChat,
    getRoomMembers
  };
};