import { useLocation, useNavigate } from 'react-router-dom';
import { PatrolInterface } from '@/components/security/PatrolInterface';

export default function PatrolInterfacePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { patrolArea, patrolTime } = location.state || { 
    patrolArea: 'Unknown Area', 
    patrolTime: 'Unknown Time' 
  };

  const handleComplete = () => {
    navigate('/', { replace: true });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto p-6">
      <PatrolInterface 
        patrolArea={patrolArea}
        patrolTime={patrolTime}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}