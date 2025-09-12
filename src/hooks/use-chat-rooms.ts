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
    if (!user?.id) {
      console.log('No user ID for fetching rooms');
      return;
    }

    console.log('Fetching rooms for user:', user.id);

    try {
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          members:chat_room_members!chat_room_members_room_id_fkey!inner(user_id),
          messages:chat_messages!chat_messages_room_id_fkey(
            message_text,
            created_at,
            sender_id,
            profiles(full_name)
          )
        `)
        .eq('members.user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        
        // Handle PGRST201 ambiguous relationship error with fallback
        if (error.code === 'PGRST201') {
          console.log('Attempting fallback query due to ambiguous relationship');
          return await fetchRoomsWithFallback();
        }
        
        throw error;
      }

      console.log('Fetched rooms data:', roomsData);

      const processedRooms = roomsData?.map(room => {
        // Sort messages by created_at to get the latest one
        const sortedMessages = room.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        return {
          ...room,
          member_count: room.members?.length || 0,
          last_message: sortedMessages?.[0] ? {
            text: sortedMessages[0].message_text,
            sender_name: sortedMessages[0].profiles?.full_name || 'Unknown',
            created_at: sortedMessages[0].created_at
          } : undefined
        };
      }) || [];

      console.log('Processed rooms:', processedRooms);
      
      // If no rooms exist, create a default general room
      if (processedRooms.length === 0) {
        console.log('No rooms found, creating default general room');
        await createDefaultGeneralRoom();
        return; // fetchRooms will be called again after room creation
      }
      
      setRooms(processedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      
      // If error is due to no rooms existing, try creating a default room
      if (error.message?.includes('infinite recursion') || error.code === 'PGRST116') {
        console.log('Creating default room due to error');
        await createDefaultGeneralRoom();
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsWithFallback = async () => {
    try {
      // Two-step fallback: first get user's room memberships, then fetch rooms
      const { data: memberships, error: memberError } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', user?.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        console.log('No room memberships found, creating default general room');
        await createDefaultGeneralRoom();
        return;
      }

      const roomIds = memberships.map(m => m.room_id);

      const { data: roomsData, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          messages:chat_messages!chat_messages_room_id_fkey(
            message_text,
            created_at,
            sender_id,
            profiles(full_name)
          )
        `)
        .in('id', roomIds)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (roomsError) throw roomsError;

      // Get member counts for each room separately
      const roomsWithMembers = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { data: memberData } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', room.id);

          const sortedMessages = room.messages?.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            ...room,
            member_count: memberData?.length || 0,
            last_message: sortedMessages?.[0] ? {
              text: sortedMessages[0].message_text,
              sender_name: sortedMessages[0].profiles?.full_name || 'Unknown',
              created_at: sortedMessages[0].created_at
            } : undefined
          };
        })
      );

      setRooms(roomsWithMembers);
    } catch (error) {
      console.error('Fallback fetch rooms failed:', error);
      await createDefaultGeneralRoom();
    }
  };

  const createDefaultGeneralRoom = async () => {
    try {
      console.log('Creating default general room');
      
      // First check if user is already in a "General" room
      const { data: existingGeneralRooms, error: checkError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          name,
          members:chat_room_members!chat_room_members_room_id_fkey!inner(user_id)
        `)
        .eq('name', 'General')
        .eq('is_active', true)
        .eq('members.user_id', user?.id);

      if (checkError) {
        console.error('Error checking for existing General room:', checkError);
      } else if (existingGeneralRooms && existingGeneralRooms.length > 0) {
        console.log('User already belongs to a General room, skipping creation');
        setTimeout(() => fetchRooms(), 500);
        return;
      }
      
      // Create a general community room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: 'General',
          description: 'General community chat',
          room_type: 'group',
          is_private: false,
          created_by: user?.id,
          max_members: 1000
        })
        .select()
        .single();

      if (roomError) {
        console.error('Error creating default room:', roomError);
        return;
      }

      console.log('Created default room:', roomData);

      // Add the current user as an admin member
      const { error: memberError } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: roomData.id,
          user_id: user?.id,
          is_admin: true
        });

      if (memberError) {
        console.error('Error adding user to default room:', memberError);
        return;
      }

      console.log('Added user to default room');
      
      // Refresh rooms after creating default room
      setTimeout(() => fetchRooms(), 500);
      
    } catch (error) {
      console.error('Error creating default general room:', error);
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

  const deleteChatRoom = async (roomId: string): Promise<void> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // First check if user has permission to delete this room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*, members:chat_room_members!chat_room_members_room_id_fkey!inner(user_id, is_admin)')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      // Check if user is room admin or it's a direct chat with the user
      const userMembership = room.members.find(member => member.user_id === user.id);
      const canDelete = userMembership?.is_admin || room.room_type === 'direct';

      if (!canDelete) {
        throw new Error('You do not have permission to delete this chat');
      }

      // Delete chat messages first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('room_id', roomId);

      if (messagesError) throw messagesError;

      // Delete room members
      const { error: membersError } = await supabase
        .from('chat_room_members')
        .delete()
        .eq('room_id', roomId);

      if (membersError) throw membersError;

      // Finally delete the room
      const { error: roomDeleteError } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', roomId);

      if (roomDeleteError) throw roomDeleteError;

      // Refresh rooms after deletion
      await fetchRooms();
    } catch (error) {
      console.error('Error deleting chat room:', error);
      throw error;
    }
  };

  const createGroupChat = async (name: string, description: string, memberIds: string[]) => {
    console.log('Creating group chat:', { name, description, memberIds, userId: user?.id });
    
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

      if (roomError) {
        console.error('Error creating room:', roomError);
        throw roomError;
      }

      console.log('Room created successfully:', roomData);

      // Add the creator and selected members
      const members = [
        { room_id: roomData.id, user_id: user?.id, is_admin: true },
        ...memberIds.map(userId => ({ room_id: roomData.id, user_id: userId, is_admin: false }))
      ];

      console.log('Adding members:', members);

      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert(members);

      if (membersError) {
        console.error('Error adding members:', membersError);
        
        // If member addition fails, try to clean up the room
        await supabase.from('chat_rooms').delete().eq('id', roomData.id);
        
        throw membersError;
      }

      console.log('Members added successfully');

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
    getRoomMembers,
    deleteChatRoom
  };
};