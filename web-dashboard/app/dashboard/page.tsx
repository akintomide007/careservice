'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Activity } from 'lucide-react';
import DspDashboard from '@/components/dashboards/DspDashboard';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import LandlordDashboard from '@/components/dashboards/LandlordDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
          <div className="text-xl font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (user.isLandlord) {
    return <LandlordDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'manager') {
    return <ManagerDashboard />;
  }

  // Default to DSP dashboard
  return <DspDashboard />;
}
