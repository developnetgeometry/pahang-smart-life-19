import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageDeliveryStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
  className?: string;
}

export default function MessageDeliveryStatus({ 
  status, 
  timestamp, 
  className = '' 
}: MessageDeliveryStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'failed':
        return 'Failed';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      {getStatusIcon()}
      <span className="opacity-70 font-medium">
        {timestamp && new Date(timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}
      </span>
      {status === 'failed' && (
        <span className="text-red-500 ml-1">
          {getStatusText()}
        </span>
      )}
    </div>
  );
}