import MaintenanceComplaintCenter from '@/components/complaints/MaintenanceComplaintCenter';
import { useAuth } from '@/contexts/AuthContext';

export default function MaintenanceComplaintCenterPage() {
  const { language } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Maintenance Complaint Center' : 'Pusat Aduan Penyelenggaraan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Monitor and manage maintenance-related complaints' 
            : 'Pantau dan urus aduan berkaitan penyelenggaraan'}
        </p>
      </div>
      <MaintenanceComplaintCenter />
    </div>
  );
}