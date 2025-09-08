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
    <div className={`flex items-center gap-3 px-4 py-3 border-t border-border/30 bg-gradient-to-r from-muted/10 to-transparent animate-fade-in ${className}`}>
      <div className="flex items-center gap-3">
        {/* Enhanced Animated Typing Dots */}
        <div className="flex space-x-1">
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-typing" style={{animationDelay: '0s'}}></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-typing" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-typing" style={{animationDelay: '0.4s'}}></div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            {getTypingText()}
          </span>
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}