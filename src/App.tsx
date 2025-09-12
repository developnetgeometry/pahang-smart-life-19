import OptimizedApp from '@/components/layout/OptimizedApp';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';

const App = () => (
  <PerformanceMonitor>
    <OptimizedApp />
  </PerformanceMonitor>
);

export default App;