import { useState, useEffect } from 'react';

interface OnlineUser {
  id: string;
  display_name: string;
  status: 'online' | 'away' | 'busy';
  last_seen: string;
}

export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([
    {
      id: '1',
      display_name: 'John Doe',
      status: 'online',
      last_seen: new Date().toISOString()
    },
    {
      id: '2', 
      display_name: 'Jane Smith',
      status: 'away',
      last_seen: new Date().toISOString()
    },
    {
      id: '3', 
      display_name: 'Mike Johnson',
      status: 'online',
      last_seen: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const updatePresence = async (status: 'online' | 'away' | 'busy' | 'offline') => {
    console.log('Updating presence to:', status);
    // Mock implementation for now
  };

  useEffect(() => {
    // Simulate presence updates
    const interval = setInterval(() => {
      setOnlineUsers(prev => 
        prev.map(user => ({
          ...user,
          last_seen: new Date().toISOString()
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    onlineUsers,
    isLoading,
    updatePresence
  };
};