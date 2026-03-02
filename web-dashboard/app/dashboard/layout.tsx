'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  CheckSquare,
  Target,
  Calendar,
  CalendarCheck,
  BarChart3,
  BookOpen,
  LogOut,
  Menu,
  X,
  Activity,
  Bell,
  Shield,
  Building2,
  Ticket,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import NotificationCenter from '@/components/NotificationCenter';
import ToastContainer from '@/components/ToastContainer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Base navigation for all users (primarily for DSP)
  const dspNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Schedule', href: '/dashboard/schedules', icon: Calendar },
    { name: 'My Client Goals', href: '/dashboard/my-goals', icon: Target },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Forms', href: '/forms', icon: ClipboardList },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ];

  // Manager navigation (team and client management)
  const managerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Client Assignments', href: '/dashboard/manager/client-assignments', icon: Users },
    { name: 'Schedule Calendar', href: '/dashboard/manager/schedule', icon: Calendar },
    { name: 'DSP Activity Log', href: '/dashboard/manager/dsp-activity', icon: Activity },
    { name: 'ISP Outcomes', href: '/dashboard/manager/isp-outcomes', icon: Target },
    { name: 'ISP Goals', href: '/dashboard/manager/goals', icon: Target },
    { name: 'DSP Progress', href: '/dashboard/manager/dsp-progress', icon: BarChart3 },
    { name: 'Team Management', href: '/dashboard/manager/team', icon: Users },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Form Documents', href: '/dashboard/forms', icon: ClipboardList },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ];

  // Admin navigation (organization management)
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Admins', href: '/dashboard/admin/admins', icon: Shield },
    { name: 'Managers', href: '/dashboard/admin/managers', icon: Users },
    { name: 'DSP Allocation', href: '/dashboard/admin/dsps', icon: Users },
    { name: 'Records', href: '/dashboard/admin/records', icon: BookOpen },
    { name: 'Form Documents', href: '/dashboard/forms', icon: ClipboardList },
    { name: 'Customization', href: '/dashboard/admin/customization', icon: Settings },
    { name: 'Audit Logs', href: '/dashboard/admin/audit', icon: Shield },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Support Tickets', href: '/dashboard/admin/tickets', icon: Ticket },
  ];

  // Super admin navigation (platform management)
  const superAdminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'System Overview', href: '/dashboard/admin/overview', icon: Activity },
    { name: 'Tenants', href: '/dashboard/admin/tenants', icon: Building2 },
    { name: 'Support Tickets', href: '/dashboard/admin/tickets', icon: Ticket },
    { name: 'Platform Audit', href: '/dashboard/admin/audit', icon: Shield },
  ];

  const isManagerUser = user?.role === 'manager';
  const isAdminUser = user?.role === 'admin';
  const isLandlord = user?.isLandlord;

  // Determine which navigation to show
  let navigation = dspNavigation;
  if (isLandlord) {
    navigation = superAdminNavigation;
  } else if (isAdminUser) {
    navigation = adminNavigation;
  } else if (isManagerUser) {
    navigation = managerNavigation;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Care System</h1>
                  <p className="text-xs text-gray-500">Management</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${active ? 'text-blue-700' : ''}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Care System</span>
            </div>
            <NotificationCenter />
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-end">
            <NotificationCenter />
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
