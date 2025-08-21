import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { SmilePlus, Heart, ThumbsUp, ThumbsDown, Laugh, Angry } from 'lucide-react';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user_profile?: {
    full_name: string;
  };
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
  className?: string;
}

const QUICK_REACTIONS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '😂', icon: Laugh, label: 'Laugh' },
  { emoji: '😮', icon: null, label: 'Wow' },
  { emoji: '😢', icon: null, label: 'Sad' },
  { emoji: '😡', icon: Angry, label: 'Angry' },
];

const ALL_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
  '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
  '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕',
  '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
  '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
  '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👹',
  '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
  '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡',
  '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
  '🖖', '👋', '🤏', '💪', '🦾', '🖕', '✊', '👊',
  '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
];

export default function MessageReactions({ 
  messageId, 
  reactions, 
  onReact, 
  className = '' 
}: MessageReactionsProps) {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionsList, setShowReactionsList] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  // Check if current user reacted with specific emoji
  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some(r => r.user_id === user?.id) || false;
  };

  // Handle clicking outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleQuickReact = (emoji: string) => {
    onReact(emoji);
  };

  const handleEmojiSelect = (emoji: string) => {
    onReact(emoji);
    setShowEmojiPicker(false);
  };

  const getReactionTooltip = (emoji: string) => {
    const reactionUsers = groupedReactions[emoji] || [];
    const userNames = reactionUsers.map(r => r.user_profile?.full_name || 'Unknown User');
    
    if (userNames.length === 0) return '';
    if (userNames.length === 1) return `${userNames[0]} reacted with ${emoji}`;
    if (userNames.length <= 3) return `${userNames.join(', ')} reacted with ${emoji}`;
    
    return `${userNames.slice(0, 2).join(', ')} and ${userNames.length - 2} others reacted with ${emoji}`;
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {/* Existing Reactions */}
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          variant={hasUserReacted(emoji) ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickReact(emoji)}
          className={`h-7 px-2 text-xs ${
            hasUserReacted(emoji) 
              ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' 
              : 'hover:bg-muted'
          }`}
          title={getReactionTooltip(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          {reactionList.length > 0 && (
            <span className="text-xs">{reactionList.length}</span>
          )}
        </Button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="h-7 w-7 p-0 hover:bg-muted"
          title="Add reaction"
        >
          <SmilePlus className="w-4 h-4" />
        </Button>

        {/* Quick Reactions Popup */}
        {showEmojiPicker && (
          <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 z-50">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                {/* Quick Reactions */}
                <div className="flex gap-1 mb-3">
                  {QUICK_REACTIONS.map(({ emoji, icon: Icon, label }) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="h-8 w-8 p-0 hover:bg-muted"
                      title={label}
                    >
                      {Icon ? <Icon className="w-4 h-4" /> : emoji}
                    </Button>
                  ))}
                </div>

                {/* All Emojis Grid */}
                <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                  {ALL_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="h-8 w-8 p-0 hover:bg-muted text-base"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Reactions Details Modal */}
      {showReactionsList && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[70vh] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Reactions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReactionsList(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-96">
                {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
                  <div key={emoji} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{emoji}</span>
                      <Badge variant="secondary">{reactionList.length}</Badge>
                    </div>
                    
                    <div className="ml-6 space-y-1">
                      {reactionList.map((reaction) => (
                        <div key={reaction.id} className="text-sm">
                          {reaction.user_profile?.full_name || 'Unknown User'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
