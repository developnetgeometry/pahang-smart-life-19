import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import { 
  Users, 
  Calendar, 
  Star, 
  TrendingUp,
  Heart,
  MessageSquare,
  Vote,
  Activity,
  PartyPopper,
  BookOpen,
  Coffee
} from 'lucide-react';

export function CommunityLeaderDashboard() {
  const { language } = useAuth();

  const engagementMetrics = [
    {
      title: language === 'en' ? 'Active Members' : 'Ahli Aktif',
      value: '156',
      icon: Users,
      trend: '+8 this month',
      status: 78
    },
    {
      title: language === 'en' ? 'Event Attendance' : 'Kehadiran Acara',
      value: '89%',
      icon: Calendar,
      trend: 'Last event',
      status: 89
    },
    {
      title: language === 'en' ? 'Feedback Score' : 'Skor Maklum Balas',
      value: '4.3/5',
      icon: Star,
      trend: 'Community satisfaction',
      status: 86
    },
    {
      title: language === 'en' ? 'Volunteer Hours' : 'Jam Sukarelawan',
      value: '245',
      icon: Heart,
      trend: 'This month'
    }
  ];

  const upcomingEvents = [
    {
      title: language === 'en' ? 'Chinese New Year Celebration' : 'Sambutan Tahun Baru Cina',
      date: 'Feb 12, 2024',
      time: '7:00 PM',
      location: 'Community Hall',
      registered: 89,
      capacity: 100,
      status: 'confirmed',
      type: 'celebration'
    },
    {
      title: language === 'en' ? 'Community Fun Run' : 'Larian Santai Komuniti',
      date: 'Feb 18, 2024',
      time: '7:00 AM',
      location: 'Park Area',
      registered: 34,
      capacity: 50,
      status: 'registration_open',
      type: 'sports'
    },
    {
      title: language === 'en' ? 'Book Club Meeting' : 'Mesyuarat Kelab Buku',
      date: 'Feb 20, 2024',
      time: '8:00 PM',
      location: 'Function Room A',
      registered: 12,
      capacity: 20,
      status: 'planning',
      type: 'education'
    }
  ];

  const communityPolls = [
    {
      title: language === 'en' ? 'Preferred time for community meetings' : 'Masa pilihan untuk mesyuarat komuniti',
      responses: 45,
      status: 'active',
      endDate: '2024-02-20',
      options: [
        { text: 'Weekday Evening (7-9 PM)', votes: 18 },
        { text: 'Weekend Morning (10-12 PM)', votes: 15 },
        { text: 'Weekend Evening (7-9 PM)', votes: 12 }
      ]
    },
    {
      title: language === 'en' ? 'Next community event suggestion' : 'Cadangan acara komuniti seterusnya',
      responses: 32,
      status: 'closed',
      endDate: '2024-02-10',
      winner: 'Cooking Workshop'
    }
  ];

  const recentSuggestions = [
    {
      user: 'Anonymous',
      suggestion: language === 'en' ? 'Better lighting in the parking area' : 'Pencahayaan yang lebih baik di kawasan parkir',
      category: 'Improvement',
      upvotes: 12,
      status: 'under_review'
    },
    {
      user: 'Mrs. Lim',
      suggestion: language === 'en' ? 'More cultural celebration events' : 'Lebih banyak acara perayaan budaya',
      category: 'Events',
      upvotes: 8,
      status: 'approved'
    },
    {
      user: 'Mr. Rahman',
      suggestion: language === 'en' ? 'Community garden project' : 'Projek kebun komuniti',
      category: 'Environment',
      upvotes: 15,
      status: 'in_progress'
    }
  ];

  const volunteerOpportunities = [
    { role: 'Event Coordinator', volunteers: 3, needed: 5 },
    { role: 'Community Photographer', volunteers: 1, needed: 2 },
    { role: 'Welcome Committee', volunteers: 4, needed: 6 },
    { role: 'Activity Organizer', volunteers: 2, needed: 4 }
  ];

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'celebration': return PartyPopper;
      case 'sports': return Activity;
      case 'education': return BookOpen;
      default: return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'registration_open': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Community Leader Dashboard' : 'Papan Pemuka Ketua Komuniti'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Community engagement and event management' : 'Penglibatan komuniti dan pengurusan acara'}
        </p>
      </div>

      {/* Community Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {engagementMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
              {metric.status && (
                <Progress value={metric.status} className="mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weather Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WeatherWidget />
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'en' ? 'Community Engagement Summary' : 'Ringkasan Penglibatan Komuniti'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? '156 active members. Next event: Chinese New Year Celebration on Feb 12.' 
                  : '156 ahli aktif. Acara seterusnya: Sambutan Tahun Baru Cina pada 12 Feb.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'en' ? 'Upcoming Community Events' : 'Acara Komuniti Akan Datang'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => {
              const IconComponent = getEventTypeIcon(event.type);
              const attendancePercentage = (event.registered / event.capacity) * 100;
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm">{event.title}</h4>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{event.date} at {event.time}</p>
                    <p>{event.location}</p>
                    <div className="flex items-center gap-2">
                      <span>{event.registered}/{event.capacity} registered</span>
                      <Progress value={attendancePercentage} className="w-16 h-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      {language === 'en' ? 'Manage' : 'Urus'}
                    </Button>
                    <Button size="sm" variant="outline">
                      {language === 'en' ? 'Promote' : 'Promosi'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Community Polls & Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              {language === 'en' ? 'Community Polls & Feedback' : 'Undian & Maklum Balas Komuniti'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {communityPolls.map((poll, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm flex-1">{poll.title}</h4>
                  <Badge className={getStatusColor(poll.status)}>
                    {poll.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  <p>{poll.responses} responses • Ends {poll.endDate}</p>
                </div>
                {poll.options ? (
                  <div className="space-y-2">
                    {poll.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center justify-between">
                        <span className="text-xs">{option.text}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(option.votes / poll.responses) * 100} className="w-12 h-1" />
                          <span className="text-xs">{option.votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Winner: {poll.winner}</p>
                )}
                <Button size="sm" variant="outline" className="mt-2">
                  {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Community Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {language === 'en' ? 'Recent Community Suggestions' : 'Cadangan Komuniti Terkini'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{suggestion.category}</Badge>
                    <Badge className={getStatusColor(suggestion.status)}>
                      {suggestion.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm">{suggestion.suggestion}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>by {suggestion.user}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {suggestion.upvotes} upvotes
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Review' : 'Semak'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volunteer Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {language === 'en' ? 'Volunteer Opportunities' : 'Peluang Sukarelawan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volunteerOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{opportunity.role}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{opportunity.volunteers}/{opportunity.needed} volunteers</span>
                    <Progress 
                      value={(opportunity.volunteers / opportunity.needed) * 100} 
                      className="w-16 h-1" 
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {language === 'en' ? 'Recruit' : 'Merekrut'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'Create Event' : 'Cipta Acara'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Vote className="h-4 w-4" />
              {language === 'en' ? 'Start Poll' : 'Mula Undian'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <MessageSquare className="h-4 w-4" />
              {language === 'en' ? 'Community Chat' : 'Sembang Komuniti'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Coffee className="h-4 w-4" />
              {language === 'en' ? 'Schedule Meeting' : 'Jadual Mesyuarat'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}