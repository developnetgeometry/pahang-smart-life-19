import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  Users, 
  Search,
  MessageCircle,
  Plus,
  Edit3,
  Trash2,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  Video
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { useRealtimeMessaging } from '@/hooks/use-realtime-messaging';
import { useChatRooms } from '@/hooks/use-chat-rooms';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from './FileUpload';
import MessageReactions from './MessageReactions';
import TypingIndicator from './TypingIndicator';
import { UserSelectionModal } from './UserSelectionModal';
import { GroupCreationModal } from './GroupCreationModal';
import { ChatListItem } from './ChatListItem';
import VideoCallRoom from './VideoCallRoom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface MarketplaceChatInfo {
  chatWith?: string;
  presetMessage?: string;
  itemInfo?: {
    title: string;
    price: number;
    id: string;
  };
}

interface DirectoryChatInfo {
  contactId: string;
  contactName: string;
  contactTitle: string;
}

interface CommunityChatProps {
  marketplaceChat?: MarketplaceChatInfo | null;
  directoryChat?: DirectoryChatInfo | null;
}

export default function CommunityChat({ marketplaceChat, directoryChat }: CommunityChatProps = {}) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showGroupCreation, setShowGroupCreation] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'direct' | 'group'>('direct');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userNames, setUserNames] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  // Custom hooks
  const { 
    rooms, 
    loading: roomsLoading, 
    createDirectChat, 
    createGroupChat,
    getRoomMembers 
  } = useChatRooms();

  const {
    messages,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    startTyping,
    stopTyping,
    isLoading: messagesLoading
  } = useRealtimeMessaging(selectedRoomId);

  // Effects
  useEffect(() => {
    if (marketplaceChat?.presetMessage) {
      setNewMessage(marketplaceChat.presetMessage);
    }
  }, [marketplaceChat]);

  useEffect(() => {
    if (directoryChat) {
      const presetMessage = language === 'en' 
        ? `Hello, I would like to contact ${directoryChat.contactName} regarding ${directoryChat.contactTitle}.`
        : `Hello, saya ingin menghubungi ${directoryChat.contactName} berkenaan ${directoryChat.contactTitle}.`;
      setNewMessage(presetMessage);
    }
  }, [directoryChat, language]);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '';
    }
  };

  // Event handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) {
      console.log('Cannot send message:', { message: newMessage.trim(), roomId: selectedRoomId });
      return;
    }

    console.log('Sending message:', { message: newMessage.trim(), roomId: selectedRoomId });

    try {
      if (editingMessageId) {
        await editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
      } else {
        await sendMessage(
          newMessage.trim(),
          'text',
          undefined,
          replyToMessageId || undefined
        );
        setReplyToMessageId(null);
      }
      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleStartDirectChat = async (userId: string) => {
    try {
      const roomId = await createDirectChat(userId);
      setSelectedRoomId(roomId);
      setShowUserSelection(false);
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat',
        variant: 'destructive',
      });
    }
  };

  const handleCreateGroup = async (name: string, description: string, memberIds: string[]) => {
    console.log('Handling group creation:', { name, description, memberIds });
    
    try {
      const roomId = await createGroupChat(name, description, memberIds);
      console.log('Group created with ID:', roomId);
      setSelectedRoomId(roomId);
      setShowGroupCreation(false);
      toast({
        title: 'Success',
        description: 'Group created successfully!',
      });
    } catch (error: any) {
      console.error('Error creating group:', error);
      
      let errorMessage = 'Failed to create group';
      
      // Provide more specific error messages
      if (error.code === '23505') {
        errorMessage = 'A group with this name already exists';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid user selected for group';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Permission denied - unable to create group';
      } else if (error.message?.includes('RLS')) {
        errorMessage = 'Database security error - please try again';
      } else if (error.message) {
        errorMessage = `Failed to create group: ${error.message}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSelectUsersForGroup = async (userIds: string[]) => {
    setSelectedUsers(userIds);
    
    // Fetch user names
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name')
        .in('id', userIds);
      
      const names = profiles?.map(p => p.full_name || 'Unknown User') || [];
      setUserNames(names);
      setShowUserSelection(false);
      setShowGroupCreation(true);
    } catch (error) {
      console.error('Error fetching user names:', error);
      setUserNames(userIds.map(() => 'Unknown User'));
      setShowUserSelection(false);
      setShowGroupCreation(true);
    }
  };

  const handleNewChatClick = (mode: 'direct' | 'group') => {
    setSelectionMode(mode);
    setShowUserSelection(true);
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentText);
    setReplyToMessageId(null);
  };

  const handleReplyToMessage = (messageId: string) => {
    setReplyToMessageId(messageId);
    setEditingMessageId(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await reactToMessage(messageId, emoji);
    } catch (error) {
      console.error('Error reacting to message:', error);
      toast({
        title: 'Error',
        description: 'Failed to react to message',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (uploadedFile: any) => {
    try {
      // Handle file upload logic here - send as message
      if (selectedRoomId && uploadedFile.url) {
        await sendMessage(
          `File: ${uploadedFile.name}`,
          'file',
          { url: uploadedFile.url }
        );
      }
      setShowFileUpload(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const handleStartVideoCall = () => {
    if (!selectedRoom) {
      toast({
        title: 'Error',
        description: 'Please select a chat first',
        variant: 'destructive',
      });
      return;
    }
    
    setShowVideoCall(true);
    
    // Notify other participants about the video call
    const callType = selectedRoom.room_type === 'direct' ? 'individual' : 'group';
    toast({
      title: 'Video Call Started',
      description: `Starting ${callType} video call with ${selectedRoom.name}`,
    });
  };

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRoom = rooms.find(room => room.id === selectedRoomId);
  const replyToMessage = messages.find(msg => msg.id === replyToMessageId);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {language === 'en' ? 'Chats' : 'Sembang'}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleNewChatClick('direct')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'New Chat' : 'Sembang Baru'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewChatClick('group')}>
                  <Users className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'New Group' : 'Kumpulan Baru'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search chats...' : 'Cari sembang...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {roomsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'Loading chats...' : 'Memuatkan sembang...'}
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No chats found' : 'Tiada sembang dijumpai'}
              </div>
            ) : (
              filteredRooms.map((room) => (
                <ChatListItem
                  key={room.id}
                  {...room}
                  isActive={selectedRoomId === room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {showVideoCall && selectedRoom ? (
          <VideoCallRoom 
            roomId={selectedRoomId}
            isHost={true}
            onLeave={() => setShowVideoCall(false)}
            onToggleChat={() => setShowVideoCall(false)}
          />
        ) : selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getUserInitials(selectedRoom.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedRoom.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.room_type === 'group' && selectedRoom.member_count && (
                        `${selectedRoom.member_count} members`
                      )}
                      {selectedRoom.room_type === 'direct' && 'Direct message'}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleStartVideoCall}
                  title={language === 'en' ? 'Start video call' : 'Mula panggilan video'}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'en' ? 'Loading messages...' : 'Memuatkan mesej...'}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'en' ? 'No messages yet' : 'Belum ada mesej'}
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id;
                    const showAvatar = !isOwn && (
                      index === 0 || 
                      messages[index - 1]?.sender_id !== message.sender_id
                    );

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                            <Avatar className={`h-8 w-8 ${showAvatar ? '' : 'invisible'}`}>
                            <AvatarFallback className="text-xs">
                              {getUserInitials(message.sender_profile?.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                          {showAvatar && !isOwn && (
                            <p className="text-xs text-muted-foreground mb-1 px-3">
                              {message.sender_profile?.full_name || 'Unknown User'}
                            </p>
                          )}

                          <div
                            className={`group relative rounded-lg px-3 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.reply_to_id && replyToMessage && (
                              <div className="mb-2 p-2 border-l-4 border-muted-foreground/20 bg-background/50 rounded">
                                <p className="text-xs text-muted-foreground">
                                  Replying to {replyToMessage.sender_profile?.full_name || 'Unknown User'}
                                </p>
                                <p className="text-sm truncate">
                                  {replyToMessage.message_text}
                                </p>
                              </div>
                            )}

                            <p className="text-sm">{message.message_text}</p>

                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatMessageTime(message.created_at)}
                              </span>

                              {isOwn && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => handleEditMessage(message.id, message.message_text)}
                                    >
                                      <Edit3 className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleReplyToMessage(message.id)}
                                    >
                                      <Reply className="h-4 w-4 mr-2" />
                                      Reply
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {/* Message Reactions */}
                            <MessageReactions
                              messageId={message.id}
                              reactions={message.reactions || []}
                              onReact={(emoji) => handleReactToMessage(message.id, emoji)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator typingUsers={typingUsers} />
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            {replyToMessageId && replyToMessage && (
              <div className="px-4 py-2 bg-muted/50 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Replying to {replyToMessage.sender_profile?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm truncate">{replyToMessage.message_text}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyToMessageId(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowFileUpload(true)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onFocus={startTyping}
                    onBlur={stopTyping}
                    placeholder={
                      editingMessageId
                        ? language === 'en' ? 'Edit message...' : 'Edit mesej...'
                        : language === 'en' ? 'Type a message...' : 'Taip mesej...'
                    }
                    className="w-full"
                  />
                </div>

                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'en' ? 'Select a chat to start messaging' : 'Pilih sembang untuk mula berkirim mesej'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserSelectionModal
        open={showUserSelection}
        onClose={() => setShowUserSelection(false)}
        onSelectUser={handleStartDirectChat}
        onCreateGroup={handleSelectUsersForGroup}
        mode={selectionMode}
      />

      <GroupCreationModal
        open={showGroupCreation}
        onClose={() => setShowGroupCreation(false)}
        onCreateGroup={handleCreateGroup}
        selectedMembers={selectedUsers}
        memberNames={userNames}
      />

      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Upload File' : 'Muat Naik Fail'}
            </DialogTitle>
          </DialogHeader>
          <FileUpload onFileUploaded={handleFileUpload} />
        </DialogContent>
      </Dialog>
    </div>
  );
}