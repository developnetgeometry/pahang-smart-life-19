import { useAuth } from '@/contexts/AuthContext';
import AdvertisementManagementComponent from '@/components/marketplace/AdvertisementManagement';

export default function AdvertisementManagement() {
  const { language } = useAuth();

  return <AdvertisementManagementComponent language={language} />;
}