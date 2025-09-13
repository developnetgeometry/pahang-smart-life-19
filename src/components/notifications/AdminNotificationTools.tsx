import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSystem } from '@/hooks/use-notification-system';
import { 
  Send, 
  Users, 
  Target, 
  Bell, 
  AlertCircle, 
  CheckCircle,
  Clock,
  MessageSquare,
  Settings
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
}

interface DeliveryStats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
}

export function AdminNotificationTools() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useNotificationSystem();

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general',
    targetType: 'all',
    specificUsers: '',
    districtId: '',
    scheduleFor: ''
  });

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: 'maintenance',
      name: language === 'en' ? 'Maintenance Alert' : 'Amaran Penyelenggaraan',
      title: language === 'en' ? 'Scheduled Maintenance' : 'Penyelenggaraan Berjadual',
      message: language === 'en' 
        ? 'There will be scheduled maintenance on {date}. Services may be temporarily unavailable.'
        : 'Akan ada penyelenggaraan berjadual pada {date}. Perkhidmatan mungkin tidak tersedia buat sementara waktu.',
      type: 'maintenance'
    },
    {
      id: 'emergency',
      name: language === 'en' ? 'Emergency Alert' : 'Amaran Kecemasan',
      title: language === 'en' ? 'Emergency Notification' : 'Notifikasi Kecemasan',
      message: language === 'en'
        ? 'This is an emergency notification. Please follow safety protocols.'
        : 'Ini adalah notifikasi kecemasan. Sila ikuti protokol keselamatan.',
      type: 'emergency'
    },
    {
      id: 'announcement',
      name: language === 'en' ? 'General Announcement' : 'Pengumuman Umum',
      title: language === 'en' ? 'Community Announcement' : 'Pengumuman Komuniti',
      message: language === 'en'
        ? 'We have an important announcement to share with the community.'
        : 'Kami mempunyai pengumuman penting untuk dikongsi dengan komuniti.',
      type: 'announcement'
    }
  ]);

  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    total: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchRecentNotifications();
    fetchDeliveryStats();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:created_by(display_name, email)
        `)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    }
  };

  const fetchDeliveryStats = async () => {
    try {
      // This would be implemented with proper analytics
      setDeliveryStats({
        total: 150,
        delivered: 145,
        failed: 3,
        pending: 2
      });
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
    }
  };

  const applyTemplate = (template: NotificationTemplate) => {
    setNotificationForm(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type
    }));
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' 
          ? 'Please fill in title and message'
          : 'Sila isi tajuk dan mesej',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    try {
      let recipientIds: string[] = [];

      if (notificationForm.targetType === 'specific' && notificationForm.specificUsers) {
        // Parse user IDs from comma-separated string
        recipientIds = notificationForm.specificUsers
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length > 0);
      } else if (notificationForm.targetType === 'district' && notificationForm.districtId) {
        // Get all users in the district
        const { data: users, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('district_id', notificationForm.districtId);

        if (error) throw error;
        recipientIds = users?.map(u => u.user_id) || [];
      } else {
        // Get all users for broadcast
        const { data: users, error } = await supabase
          .from('profiles')
          .select('user_id');

        if (error) throw error;
        recipientIds = users?.map(u => u.user_id) || [];
      }

      await sendNotification(
        notificationForm.title,
        notificationForm.message,
        recipientIds,
        {
          notificationType: notificationForm.type,
          senderId: user?.id
        }
      );

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' 
          ? `Notification sent to ${recipientIds.length} users`
          : `Notifikasi dihantar kepada ${recipientIds.length} pengguna`
      });

      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'general',
        targetType: 'all',
        specificUsers: '',
        districtId: '',
        scheduleFor: ''
      });

      // Refresh data
      fetchRecentNotifications();
      fetchDeliveryStats();

    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' 
          ? 'Failed to send notification'
          : 'Gagal menghantar notifikasi',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {language === 'en' ? 'Admin Notification Tools' : 'Alat Notifikasi Admin'}
        </h2>
      </div>

      {/* Delivery Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{deliveryStats.total}</div>
            <div className="text-sm text-muted-foreground">
              {language === 'en' ? 'Total Sent' : 'Jumlah Dihantar'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</div>
            <div className="text-sm text-muted-foreground">
              {language === 'en' ? 'Delivered' : 'Terhantar'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{deliveryStats.failed}</div>
            <div className="text-sm text-muted-foreground">
              {language === 'en' ? 'Failed' : 'Gagal'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{deliveryStats.pending}</div>
            <div className="text-sm text-muted-foreground">
              {language === 'en' ? 'Pending' : 'Belum Selesai'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              {language === 'en' ? 'Send Notification' : 'Hantar Notifikasi'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {language === 'en' ? 'Title' : 'Tajuk'}
              </label>
              <Input
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder={language === 'en' ? 'Notification title' : 'Tajuk notifikasi'}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                {language === 'en' ? 'Message' : 'Mesej'}
              </label>
              <Textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder={language === 'en' ? 'Notification message' : 'Mesej notifikasi'}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {language === 'en' ? 'Type' : 'Jenis'}
                </label>
                <Select 
                  value={notificationForm.type}
                  onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      {language === 'en' ? 'General' : 'Umum'}
                    </SelectItem>
                    <SelectItem value="announcement">
                      {language === 'en' ? 'Announcement' : 'Pengumuman'}
                    </SelectItem>
                    <SelectItem value="maintenance">
                      {language === 'en' ? 'Maintenance' : 'Penyelenggaraan'}
                    </SelectItem>
                    <SelectItem value="emergency">
                      {language === 'en' ? 'Emergency' : 'Kecemasan'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  {language === 'en' ? 'Target' : 'Sasaran'}
                </label>
                <Select 
                  value={notificationForm.targetType}
                  onValueChange={(value) => setNotificationForm(prev => ({ ...prev, targetType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === 'en' ? 'All Users' : 'Semua Pengguna'}
                    </SelectItem>
                    <SelectItem value="district">
                      {language === 'en' ? 'District' : 'Daerah'}
                    </SelectItem>
                    <SelectItem value="specific">
                      {language === 'en' ? 'Specific Users' : 'Pengguna Tertentu'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {notificationForm.targetType === 'specific' && (
              <div>
                <label className="text-sm font-medium">
                  {language === 'en' ? 'User IDs (comma separated)' : 'ID Pengguna (dipisahkan koma)'}
                </label>
                <Input
                  value={notificationForm.specificUsers}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, specificUsers: e.target.value }))}
                  placeholder="user1@example.com, user2@example.com"
                />
              </div>
            )}

            <Button 
              onClick={handleSendNotification} 
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Sending...' : 'Menghantar...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Send Notification' : 'Hantar Notifikasi'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Templates and Recent Notifications */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {language === 'en' ? 'Templates' : 'Templat'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {template.title}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyTemplate(template)}
                    >
                      {language === 'en' ? 'Use' : 'Guna'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {language === 'en' ? 'Recent Notifications' : 'Notifikasi Terkini'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {notification.notification_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
                {recentNotifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    {language === 'en' ? 'No recent notifications' : 'Tiada notifikasi terkini'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}