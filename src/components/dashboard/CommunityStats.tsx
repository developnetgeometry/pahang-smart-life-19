import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Calendar, ShoppingBag, Wrench } from "lucide-react";
import { useCommunicationStats } from "@/hooks/use-communication-stats";
import { useUserPresence } from "@/hooks/use-user-presence";

interface CommunityStatsProps {
  language: 'en' | 'ms';
}

export function CommunityStats({ language }: CommunityStatsProps) {
  const { stats } = useCommunicationStats();
  const { onlineUsers } = useUserPresence();

  const statsData = [
    {
      title: language === 'en' ? 'Online Now' : 'Dalam Talian',
      value: onlineUsers.length,
      icon: Users,
      color: 'bg-green-500',
      description: language === 'en' ? 'Active residents' : 'Penduduk aktif'
    },
    {
      title: language === 'en' ? 'Messages Today' : 'Mesej Hari Ini',
      value: stats.voiceMessages + stats.fileShares,
      icon: MessageSquare,
      color: 'bg-blue-500',
      description: language === 'en' ? 'Community chats' : 'Sembang komuniti'
    },
    {
      title: language === 'en' ? 'Events This Week' : 'Acara Minggu Ini',
      value: 3,
      icon: Calendar,
      color: 'bg-purple-500',
      description: language === 'en' ? 'Upcoming events' : 'Acara akan datang'
    },
    {
      title: language === 'en' ? 'Marketplace Items' : 'Item Pasaran',
      value: 12,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      description: language === 'en' ? 'Available now' : 'Tersedia sekarang'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          {language === 'en' ? 'Community Stats' : 'Statistik Komuniti'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsData.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.color} text-white`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="font-bold">
              {stat.value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}