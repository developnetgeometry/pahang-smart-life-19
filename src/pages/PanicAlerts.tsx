import PanicAlertHistory from '@/components/emergency/PanicAlertHistory';
import { useAuth } from '@/contexts/AuthContext';

export default function PanicAlerts() {
  const { language } = useAuth();
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {language === 'en' ? 'My Panic Alert History' : 'Sejarah Amaran Panik Saya'}
          </h1>
        </div>
        <PanicAlertHistory language={language} />
      </div>
    </div>
  );
}