'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Database, Calendar, CheckCircle, XCircle, Search, Filter, Plus, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  domain: string | null;
  plan: string;
  maxUsers: number;
  maxClients: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
    clients: number;
  };
}

export default function TenantsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    subdomain: '',
    plan: 'basic',
    maxUsers: 50,
    maxClients: 100,
    adminEmail: '',
    adminPassword: '',
  });

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('isActive', filterStatus === 'active' ? 'true' : 'false');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/organizations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle organization status
  const toggleOrgStatus = async (orgId: string, activate: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = activate ? 'activate' : 'suspend';
      const response = await fetch(`${API_URL}/api/admin/organizations/${orgId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchOrganizations();
        setSelectedOrg(null);
      }
    } catch (error) {
      console.error('Error toggling organization status:', error);
    }
  };

  // Create new organization
  const createOrganization = async () => {
    if (!newOrg.name || !newOrg.subdomain) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/tenants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrg),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchOrganizations();
        setShowAddModal(false);
        setNewOrg({
          name: '',
          subdomain: '',
          plan: 'basic',
          maxUsers: 50,
          maxClients: 100,
          adminEmail: '',
          adminPassword: '',
        });
        
        // Show credentials to user
        if (data.initialCredentials) {
          alert(
            `Organization created successfully!\n\n` +
            `Initial Admin Credentials:\n` +
            `Email: ${data.initialCredentials.email}\n` +
            `Password: ${data.initialCredentials.password}\n\n` +
            `Please save these credentials and share them with the organization admin.`
          );
        } else {
          alert('Organization created successfully!');
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create organization'}`);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [filterStatus]);

  // Filter organizations by search term
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
              <p className="text-sm text-gray-500">Manage organizations and subscriptions</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Tenant
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Organizations</span>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{organizations.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Active</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {organizations.filter(o => o.isActive).length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Suspended</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">
            {organizations.filter(o => !o.isActive).length}
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading organizations...</p>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'No organizations match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">{org.subdomain}.careservice.com</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {org._count.users} / {org.maxUsers}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {org._count.clients} / {org.maxClients}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {org.isActive ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-red-600">
                          <XCircle className="w-4 h-4" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(org.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/admin/tenants/${org.id}`)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        View Details
                      </button>
                      {org.isActive ? (
                        <button
                          onClick={() => toggleOrgStatus(org.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleOrgStatus(org.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Organization</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  placeholder="e.g., ABC Care Services"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Subdomain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newOrg.subdomain}
                    onChange={(e) => setNewOrg({ ...newOrg, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="abc-care"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                    .careservice.com
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Only lowercase letters, numbers, and hyphens allowed</p>
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email (Optional)
                </label>
                <input
                  type="email"
                  value={newOrg.adminEmail}
                  onChange={(e) => setNewOrg({ ...newOrg, adminEmail: e.target.value })}
                  placeholder="admin@example.com (auto-generated if empty)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate: admin@subdomain.careservice.com</p>
              </div>

              {/* Admin Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password (Optional)
                </label>
                <input
                  type="password"
                  value={newOrg.adminPassword}
                  onChange={(e) => setNewOrg({ ...newOrg, adminPassword: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate a secure password</p>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <select
                  value={newOrg.plan}
                  onChange={(e) => setNewOrg({ ...newOrg, plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Resource Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={newOrg.maxUsers}
                    onChange={(e) => setNewOrg({ ...newOrg, maxUsers: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Clients
                  </label>
                  <input
                    type="number"
                    value={newOrg.maxClients}
                    onChange={(e) => setNewOrg({ ...newOrg, maxClients: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={createOrganization}
                  disabled={saving || !newOrg.name || !newOrg.subdomain}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creating...' : 'Create Organization'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedOrg.name}</h2>
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Subdomain</span>
                    <p className="text-sm font-medium text-gray-900">{selectedOrg.subdomain}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Plan</span>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedOrg.plan}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p className={`text-sm font-medium ${selectedOrg.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedOrg.isActive ? 'Active' : 'Suspended'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created</span>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedOrg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Resource Usage</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrg._count.users} / {selectedOrg.maxUsers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(selectedOrg._count.users / selectedOrg.maxUsers) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Clients</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrg._count.clients} / {selectedOrg.maxClients}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(selectedOrg._count.clients / selectedOrg.maxClients) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedOrg.isActive ? (
                  <button
                    onClick={() => toggleOrgStatus(selectedOrg.id, false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Suspend Organization
                  </button>
                ) : (
                  <button
                    onClick={() => toggleOrgStatus(selectedOrg.id, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Activate Organization
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
