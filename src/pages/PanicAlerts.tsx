import PanicAlertHistory from '@/components/emergency/PanicAlertHistory';
import { useAuth } from '@/contexts/AuthContext';

export default function PanicAlerts() {
  const { language } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <PanicAlertHistory language={language} />
    </div>
  );
}