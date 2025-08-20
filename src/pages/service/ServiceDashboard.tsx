import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Star, DollarSign, Briefcase, Plus, TrendingUp } from 'lucide-react';

export default function ServiceDashboard() {
  const { user, language } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [serviceProvider, setServiceProvider] = useState(null);

  useEffect(() => {
    if (user) {
      fetchServiceData();
    }
  }, [user]);

  const fetchServiceData = async () => {
    try {
      // Fetch service provider profile
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      setServiceProvider(providerData);

      // Fetch appointments
      if (providerData) {
        const { data: appointmentData } = await supabase
          .from('service_appointments')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('appointment_date', { ascending: true });

        setAppointments(appointmentData || []);
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceMetrics = [
    {
      title: language === 'en' ? 'Total Appointments' : 'Jumlah Temujanji',
      value: '24',
      icon: Calendar,
      trend: '+12% this month',
      color: 'blue'
    },
    {
      title: language === 'en' ? 'Average Rating' : 'Penilaian Purata',
      value: '4.8',
      icon: Star,
      trend: '+0.2 from last month',
      color: 'yellow'
    },
    {
      title: language === 'en' ? 'Monthly Revenue' : 'Pendapatan Bulanan',
      value: 'RM 8,500',
      icon: DollarSign,
      trend: '+18% from last month',
      color: 'green'
    },
    {
      title: language === 'en' ? 'Active Clients' : 'Klien Aktif',
      value: '15',
      icon: Users,
      trend: '+3 new clients',
      color: 'purple'
    }
  ];

  const upcomingAppointments = [
    {
      id: '1',
      client: 'Ahmad Hassan',
      service: 'Air Conditioning Service',
      date: '2024-01-16',
      time: '10:00',
      status: 'confirmed',
      location: 'Block A, Unit 12-3'
    },
    {
      id: '2',
      client: 'Sarah Chen',
      service: 'Plumbing Repair',
      date: '2024-01-16',
      time: '14:30',
      status: 'pending',
      location: 'Block B, Unit 8-5'
    },
    {
      id: '3',
      client: 'Kumar Raman',
      service: 'Electrical Installation',
      date: '2024-01-17',
      time: '09:00',
      status: 'confirmed',
      location: 'Block C, Unit 15-2'
    }
  ];

  const recentFeedback = [
    {
      client: 'Fatimah Ali',
      service: 'Cleaning Service',
      rating: 5,
      comment: 'Excellent service! Very professional and thorough.',
      date: '2024-01-14'
    },
    {
      client: 'David Tan',
      service: 'Maintenance Check',
      rating: 4,
      comment: 'Good work, completed on time.',
      date: '2024-01-13'
    },
    {
      client: 'Priya Sharma',
      service: 'Pest Control',
      rating: 5,
      comment: 'Very satisfied with the results.',
      date: '2024-01-12'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <div className="p-6">Loading service dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            {language === 'en' ? 'Service Provider Dashboard' : 'Papan Pemuka Penyedia Perkhidmatan'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage your services and appointments' : 'Urus perkhidmatan dan temujanji anda'}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'New Appointment' : 'Temujanji Baru'}
        </Button>
      </div>

      {/* Service Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {serviceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
              {metric.title.includes('Rating') && (
                <div className="flex items-center mt-2">
                  {renderStars(Math.floor(parseFloat(metric.value)))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'en' ? 'Upcoming Appointments' : 'Temujanji Akan Datang'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{appointment.client}</h4>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{appointment.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(appointment.status)}
                    <Button size="sm" variant="outline">
                      {language === 'en' ? 'Details' : 'Butiran'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Customer Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {language === 'en' ? 'Recent Customer Feedback' : 'Maklum Balas Pelanggan Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedback.map((feedback, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{feedback.client}</h4>
                      <p className="text-xs text-muted-foreground">{feedback.service}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(feedback.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(feedback.rating)}
                    <span className="text-sm font-medium">{feedback.rating}/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{feedback.comment}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'View Schedule' : 'Lihat Jadual'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Users className="h-4 w-4" />
              {language === 'en' ? 'Manage Customers' : 'Urus Pelanggan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <DollarSign className="h-4 w-4" />
              {language === 'en' ? 'Generate Invoice' : 'Jana Invois'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <TrendingUp className="h-4 w-4" />
              {language === 'en' ? 'View Analytics' : 'Lihat Analitik'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}