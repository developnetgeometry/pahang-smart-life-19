import { useState, useEffect } from 'react';

interface CommunicationStats {
  activeUsers: number;
  onlineUsers: number;
  unreadMessages: number;
  todayAnnouncements: number;
  recentCalls: number;
  voiceMessages: number;
  fileShares: number;
  lastUpdated: string;
}

export const useCommunicationStats = () => {
  const [stats, setStats] = useState<CommunicationStats>({
    activeUsers: 24,
    onlineUsers: 8,
    unreadMessages: 5,
    todayAnnouncements: 2,
    recentCalls: 3,
    voiceMessages: 12,
    fileShares: 8,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        unreadMessages: Math.max(0, prev.unreadMessages + Math.floor(Math.random() * 2) - 1),
        lastUpdated: new Date().toISOString()
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading, error };
};