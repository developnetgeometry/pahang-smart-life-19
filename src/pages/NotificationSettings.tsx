import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationSetup } from '@/components/notifications/NotificationSetup';

export default function NotificationSettings() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Notification Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl">
        <NotificationSetup />
      </div>
    </div>
  );
}