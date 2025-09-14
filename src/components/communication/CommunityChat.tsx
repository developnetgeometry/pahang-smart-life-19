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
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { useView } from '@/contexts/ViewContext';
import { Separator } from '@/components/ui/separator';
import { useRealtimeMessaging } from '@/hooks/use-realtime-messaging';
import { useChatRooms } from '@/hooks/use-chat-rooms';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from './FileUpload';
import MessageReactions from './MessageReactions';
import TypingIndicator from './TypingIndicator';
import { UserSelectionModal } from './UserSelectionModal';
import { ChatListItem } from './ChatListItem';

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
import { useToast } from '@/hooks/use-toast';
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
  initialRoomId?: string;
}

export default function CommunityChat({ marketplaceChat, directoryChat, initialRoomId }: CommunityChatProps = {}) {
  const { language, user } = useAuth();
  const { t } = useTranslation(language);
  const { isMobile } = useView();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Custom hooks
  const { 
    rooms, 
    loading: roomsLoading, 
    createDirectChat,
    getRoomMembers,
    deleteChatRoom 
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
    if (initialRoomId && initialRoomId !== selectedRoomId) {
      // If an initial room ID is provided, select it immediately
      console.log('Setting room ID from initial:', initialRoomId);
      setSelectedRoomId(initialRoomId);
    } else if (rooms.length > 0 && !selectedRoomId && !initialRoomId) {
      // Otherwise, select the first available room only if no initial room was specified
      setSelectedRoomId(rooms[0].id);
    } else if (initialRoomId && rooms.length > 0 && !rooms.find(room => room.id === initialRoomId)) {
      // If initial room ID was provided but not found after rooms loaded, fall back to first room
      console.warn('Initial room ID not found, falling back to first available room:', initialRoomId);
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, initialRoomId]);

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
        // Get room members to send notifications (the database trigger will handle notifications automatically)
        const roomMembers = await getRoomMembers(selectedRoomId);
        const recipientIds = roomMembers
          .filter(member => member.user_id !== user?.id)
          .map(member => member.user_id);

        console.log('Sending message to room with members:', recipientIds);

        // The database trigger will automatically create notifications for all room members
        await sendMessage(
          newMessage.trim(),
          'text',
          undefined,
          replyToMessageId || undefined,
          {
            isMarketplaceChat: marketplaceChat !== null,
            recipientIds // This helps with additional push notifications if needed
          }
        );
        setReplyToMessageId(null);
      }
      setNewMessage('');
      console.log('Message sent successfully - notifications will be handled automatically by database trigger');
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

  const handleNewChatClick = () => {
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

  const handleDeleteChat = async () => {
    if (!selectedRoomId) return;
    
    try {
      await deleteChatRoom(selectedRoomId);
      setSelectedRoomId(''); // Clear selection after deletion
      toast({
        title: 'Success',
        description: 'Chat deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete chat',
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


  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    (room.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRoom = rooms.find(room => room.id === selectedRoomId);
  const replyToMessage = messages.find(msg => msg.id === replyToMessageId);

  return (
    <div className="flex min-h-[500px] h-[70vh] max-h-[800px] border rounded-xl overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 shadow-lg backdrop-blur-sm animate-fade-in">
      {/* Chat List Sidebar */}
      <div className={`${isMobile ? (selectedRoomId ? 'hidden' : 'w-full') : 'w-full md:w-1/3'} ${!isMobile && 'border-r border-border/50'} flex flex-col bg-gradient-to-b from-muted/20 to-transparent backdrop-blur-sm`}>
        {/* Header */}
        <div className="p-4 md:p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">
              {t('chats')}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleNewChatClick}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('newChat')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchChats')}
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
      <div className={`${isMobile ? (selectedRoomId ? 'w-full' : 'hidden') : 'flex-1'} flex flex-col`}>
        {selectedRoomId ? (
          <>
            {/* Chat Header */}
            <div className="p-3 md:p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-background to-secondary/10 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedRoomId(null)}
                      className="mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg hover-scale">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                        {getUserInitials(selectedRoom?.name || 'Chat')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground/90">{selectedRoom?.name || 'Loading chat...'}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedRoom?.room_type === 'group' && selectedRoom?.member_count && (
                          `${selectedRoom.member_count} members`
                        )}
                        {selectedRoom?.room_type === 'direct' && 'Direct message'}
                        {!selectedRoom && '...'}
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('deleteChat')}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('deleteChat')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('deleteChatConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteChat}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('loadingMessages')}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('noMessagesYet')}
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
                          <div className="relative">
                            <Avatar className={`h-8 w-8 border-2 border-background shadow-sm hover-scale ${showAvatar ? '' : 'invisible'}`}>
                              <AvatarFallback className="text-xs bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground font-medium">
                                {getUserInitials(message.sender_profile?.full_name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            {showAvatar && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
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
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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
                                </div>
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
                        ? t('editMessage')
                        : t('typeAMessage')
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
              <p>{t('selectChatToStart')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserSelectionModal
        open={showUserSelection}
        onClose={() => setShowUserSelection(false)}
        onSelectUser={handleStartDirectChat}
      />

      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('uploadFile')}
            </DialogTitle>
          </DialogHeader>
          <FileUpload onFileUploaded={handleFileUpload} />
        </DialogContent>
      </Dialog>
    </div>
  );
}