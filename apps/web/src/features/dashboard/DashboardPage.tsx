import DashboardDrillDown from './components/DashboardDrillDown.tsx';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'failed') {
      alert('Payment checkout was cancelled or failed.');
      window.history.replaceState({}, '', '/dashboard');
    } else if (status === 'succeeded' || (searchParams.has('subscription_id') && status !== 'failed')) {
      alert('Payment successful! Your plan will be updated shortly.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">Dashboard</h1>
          <p className="text-base text-steel mt-1">
            Manage your batches, students, and staff in one place.
          </p>
        </div>
      </div>

      {/* Main Grid-Based Drill-Down UI */}
      <DashboardDrillDown />
    </div>
  );
}
