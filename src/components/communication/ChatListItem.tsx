import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatListItemProps {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  member_count?: number;
  last_message?: {
    text: string;
    sender_name: string;
    created_at: string;
  };
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  name,
  description,
  room_type,
  member_count,
  last_message,
  isActive,
  onClick
}) => {
  const getIcon = () => {
    switch (room_type) {
      case 'direct':
        return <MessageCircle className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 border-l-4 border-primary' 
          : 'hover:bg-muted/50'
      }`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-sm">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
          {getIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium truncate">{name}</p>
          {room_type === 'group' && member_count && (
            <Badge variant="secondary" className="text-xs">
              {member_count}
            </Badge>
          )}
        </div>

        {last_message ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate flex-1">
              <span className="font-medium">{last_message.sender_name}:</span>{' '}
              {last_message.text}
            </p>
            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
              {formatTime(last_message.created_at)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {description || 'No messages yet'}
          </p>
        )}
      </div>
    </div>
  );
};