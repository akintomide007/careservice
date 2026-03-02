'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Database, 
  HardDrive,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ticket,
  TrendingUp,
  Clock
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TenantDetails {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  maxUsers: number;
  maxClients: number;
  isActive: boolean;
  billingStatus: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  storageUsedMB: number;
  createdAt: string;
  lastActivityAt: string;
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    isActive: boolean;
    createdAt: string;
  }>;
  recentTickets?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    reporter?: {
      firstName: string;
      lastName: string;
    };
  }>;
  metrics?: Array<{
    id: string;
    metricType: string;
    value: number;
    recordedAt: string;
  }>;
  _count: {
    users: number;
    clients: number;
  };
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantDetails();
  }, [params.id]);

  const fetchTenantDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/organizations/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenant(data);
      } else {
        console.error('Failed to fetch tenant details');
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tenant Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/admin/tenants')}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  const usagePercentage = {
    users: (tenant._count.users / tenant.maxUsers) * 100,
    clients: (tenant._count.clients / tenant.maxClients) * 100,
  };

  const daysRemaining = tenant.subscriptionEnd 
    ? Math.floor((new Date(tenant.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin/tenants')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tenants
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-gray-500">{tenant.subdomain}.careservice.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {tenant.isActive ? (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                <XCircle className="w-5 h-5" />
                Suspended
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Users</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{tenant._count.users}</div>
          <p className="text-xs text-gray-500 mt-1">of {tenant.maxUsers} max</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Storage Used</span>
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{tenant.storageUsedMB}</div>
          <p className="text-xs text-gray-500 mt-1">MB</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Plan</span>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 capitalize">{tenant.plan}</div>
          <p className="text-xs text-gray-500 mt-1">{daysRemaining ? `${daysRemaining} days left` : 'Active'}</p>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Users</span>
                <span className="font-medium text-gray-900">
                  {tenant._count.users} / {tenant.maxUsers} ({Math.round(usagePercentage.users)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    usagePercentage.users > 90 ? 'bg-red-500' :
                    usagePercentage.users > 75 ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage.users, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium text-gray-900">{tenant.storageUsedMB} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full"
                  style={{ width: `${Math.min((tenant.storageUsedMB / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`text-sm font-medium ${
                tenant.billingStatus === 'active' ? 'text-green-600' :
                tenant.billingStatus === 'suspended' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {tenant.billingStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{tenant.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Started</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(tenant.subscriptionStart).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expires</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(tenant.subscriptionEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Days Remaining</span>
              <span className={`text-sm font-medium ${
                daysRemaining && daysRemaining < 30 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {daysRemaining} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Activity</span>
              <span className="text-sm font-medium text-gray-900">
                {tenant.lastActivityAt ? new Date(tenant.lastActivityAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Database Activity</h2>
          <Database className="w-5 h-5 text-gray-400" />
        </div>

        {tenant.metrics && tenant.metrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric Type</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tenant.metrics.slice(0, 20).map((metric, index) => (
                  <tr key={metric.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-gray-900 capitalize">
                        {metric.metricType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {metric.value}
                      {metric.metricType === 'storage_mb' && ' MB'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {new Date(metric.recordedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tenant.metrics.length > 20 && (
              <p className="text-sm text-gray-500 text-center mt-3">
                +{tenant.metrics.length - 20} more records
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No database activity recorded</p>
          </div>
        )}
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Support Tickets</h2>
          <Ticket className="w-5 h-5 text-gray-400" />
        </div>

        {tenant.recentTickets && tenant.recentTickets.length > 0 ? (
          <div className="space-y-3">
            {tenant.recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Category: {ticket.category}</span>
                    {ticket.reporter && (
                      <span>By: {ticket.reporter.firstName} {ticket.reporter.lastName}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No support tickets</p>
          </div>
        )}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users ({tenant._count.users})</h2>
        <div className="space-y-3">
          {tenant.users.slice(0, 10).map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                  {user.role}
                </span>
                {user.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
          {tenant._count.users > 10 && (
            <p className="text-sm text-gray-500 text-center">
              +{tenant._count.users - 10} more users
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
