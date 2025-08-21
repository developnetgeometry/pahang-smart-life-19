import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  user_id: string;
  user_name: string;
  room_id: string;
  started_at: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

export default function TypingIndicator({ typingUsers, className = '' }: TypingIndicatorProps) {
  const { language } = useAuth();

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    const count = typingUsers.length;
    
    if (count === 1) {
      return language === 'en' 
        ? `${typingUsers[0].user_name} is typing...`
        : `${typingUsers[0].user_name} sedang menaip...`;
    }
    
    if (count === 2) {
      return language === 'en'
        ? `${typingUsers[0].user_name} and ${typingUsers[1].user_name} are typing...`
        : `${typingUsers[0].user_name} dan ${typingUsers[1].user_name} sedang menaip...`;
    }
    
    return language === 'en'
      ? `${typingUsers[0].user_name} and ${count - 1} others are typing...`
      : `${typingUsers[0].user_name} dan ${count - 1} lain sedang menaip...`;
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Animated Typing Dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
        
        <Badge variant="secondary" className="text-xs animate-pulse">
          {getTypingText()}
        </Badge>
      </div>
    </div>
  );
}