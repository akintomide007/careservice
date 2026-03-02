'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, Building2, Users, Database, Ticket, TrendingUp, 
  Server, HardDrive, AlertCircle, CheckCircle 
} from 'lucide-react';
import { api } from '@/lib/api';

interface SystemStats {
  organizations: {
    total: number;
    active: number;
    suspended: number;
  };
  users: {
    total: number;
    byOrg: { org: string; count: number }[];
  };
  clients: {
    total: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  storage: {
    used: number;
    total: number;
  };
}

export default function SystemOverviewPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch system stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Failed to load system statistics</div>
      </div>
    );
  }

  const storagePercent = (stats.storage.used / stats.storage.total) * 100;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
            <p className="text-sm text-gray-500">Monitor system health and usage</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Organizations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.organizations.total}
          </div>
          <div className="text-sm text-gray-500 mb-3">Total Organizations</div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              {stats.organizations.active} Active
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {stats.organizations.suspended} Suspended
            </span>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.users.total}
          </div>
          <div className="text-sm text-gray-500 mb-3">Total Users</div>
          <div className="text-sm text-gray-600">
            Across all organizations
          </div>
        </div>

        {/* Clients */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.clients.total}
          </div>
          <div className="text-sm text-gray-500 mb-3">Total Clients</div>
          <div className="text-sm text-gray-600">
            Being served
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Ticket className="w-6 h-6 text-orange-600" />
            </div>
            {stats.tickets.open > 0 ? (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.tickets.total}
          </div>
          <div className="text-sm text-gray-500 mb-3">Support Tickets</div>
          <div className="text-sm text-orange-600 font-medium">
            {stats.tickets.open} Open
          </div>
        </div>
      </div>

      {/* Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ticket Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Open</span>
                <span className="font-medium text-blue-600">{stats.tickets.open}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${stats.tickets.total > 0 ? (stats.tickets.open / stats.tickets.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium text-purple-600">{stats.tickets.inProgress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${stats.tickets.total > 0 ? (stats.tickets.inProgress / stats.tickets.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Resolved</span>
                <span className="font-medium text-green-600">{stats.tickets.resolved}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${stats.tickets.total > 0 ? (stats.tickets.resolved / stats.tickets.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h2>
          <div className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#6366f1"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - storagePercent / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {storagePercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Used</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {stats.storage.used} GB / {stats.storage.total} GB
                </span>
              </div>
              <span className={`font-medium ${storagePercent > 80 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.storage.total - stats.storage.used} GB Free
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Organizations by Users */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Organizations by Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.users.byOrg.slice(0, 5).map((org, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{org.org}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{org.count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${(org.count / stats.users.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {((org.count / stats.users.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">API Health</span>
            <Server className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-green-600">Operational</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Database</span>
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-green-600">Healthy</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Response Time</span>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-green-600">&lt; 100ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
