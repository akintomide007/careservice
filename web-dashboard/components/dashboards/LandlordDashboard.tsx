'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Building2,
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Shield
} from 'lucide-react';

// Simplified type definitions for landlord view
interface TenantMetrics {
  id: string;
  name: string;
  subdomain: string;
  billingStatus: string;
  billingEmail: string;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  totalUsers: number;
  totalClients: number;
  storageUsedMB: number;
  lastActivityAt: Date;
  stats: {
    totalUsers: number;
    totalClients: number;
  };
}

interface SystemOverview {
  organizations: {
    total: number;
    active: number;
    suspended: number;
    cancelled: number;
  };
}

interface PlatformHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  activeConnections: number;
  responseTime: number;
}

export default function LandlordDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [tenants, setTenants] = useState<TenantMetrics[]>([]);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth>({
    status: 'healthy',
    uptime: 99.9,
    activeConnections: 0,
    responseTime: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      
      // Load only tenant-related data
      const [overviewData, tenantsData] = await Promise.all([
        api.request('/api/admin/overview', { method: 'GET' }),
        api.getTenants()
      ]);

      const responseTime = Date.now() - startTime;

      setOverview(overviewData);
      setTenants(tenantsData);
      
      // Calculate platform health
      setPlatformHealth({
        status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'critical',
        uptime: 99.9,
        activeConnections: tenantsData.filter((t: TenantMetrics) => t.billingStatus === 'active').length,
        responseTime
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setPlatformHealth(prev => ({ ...prev, status: 'critical' }));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = !searchTerm || 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.billingEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.billingStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-600" />
            Landlord Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Tenant Management & Platform Overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Platform Health Status */}
      <div className={`rounded-xl p-6 border-2 ${
        platformHealth.status === 'healthy' ? 'bg-green-50 border-green-200' :
        platformHealth.status === 'degraded' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              platformHealth.status === 'healthy' ? 'bg-green-600' :
              platformHealth.status === 'degraded' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {platformHealth.status === 'healthy' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Platform Status: {platformHealth.status.charAt(0).toUpperCase() + platformHealth.status.slice(1)}
              </h3>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-8 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-gray-900">{platformHealth.uptime}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Active Tenants</p>
              <p className="text-lg font-bold text-gray-900">{platformHealth.activeConnections}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Response Time</p>
              <p className="text-lg font-bold text-gray-900">{platformHealth.responseTime}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Organizations</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{overview?.organizations.total || 0}</p>
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {overview?.organizations.active || 0} Active
                </span>
                {(overview?.organizations.suspended || 0) > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    {overview?.organizations.suspended} Suspended
                  </span>
                )}
              </div>
            </div>
            <Building2 className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/admin/audit')}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Audit Logs</p>
              <p className="text-xl font-semibold text-purple-600 mt-1">View Platform Logs</p>
              <p className="text-xs text-gray-500 mt-2">Security & compliance tracking</p>
            </div>
            <Shield className="w-10 h-10 text-purple-600 opacity-20" />
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/admin/records')}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Records</p>
              <p className="text-xl font-semibold text-green-600 mt-1">Platform Records</p>
              <p className="text-xs text-gray-500 mt-2">Organization-level records</p>
            </div>
            <FileText className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </button>
      </div>

      {/* Tenant List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Organizations ({filteredTenants.length})
            </h2>
            <button
              onClick={() => router.push('/dashboard/admin/tenants')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Manage All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredTenants.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No organizations found</p>
            </div>
          ) : (
            filteredTenants.map((tenant) => (
              <div key={tenant.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.billingStatus)}`}>
                        {tenant.billingStatus}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Subdomain</p>
                        <p className="font-medium text-gray-900">{tenant.subdomain}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Users</p>
                        <p className="font-medium text-gray-900">{tenant.stats.totalUsers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clients</p>
                        <p className="font-medium text-gray-900">{tenant.stats.totalClients}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Storage</p>
                        <p className="font-medium text-gray-900">{tenant.storageUsedMB} MB</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/admin/tenants/${tenant.id}`)}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/admin/tenants')}
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-gray-900">Manage Tenants</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard/admin/audit')}
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-gray-900">View Audit Logs</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard/admin/records')}
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-green-600" />
              <span className="font-medium text-gray-900">Platform Records</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
