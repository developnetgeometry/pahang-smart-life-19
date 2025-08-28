import { useAuth } from '@/contexts/AuthContext';
import OrderHistory from '@/components/marketplace/OrderHistory';

export default function MyOrders() {
  const { language } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <OrderHistory language={language} />
    </div>
  );
}