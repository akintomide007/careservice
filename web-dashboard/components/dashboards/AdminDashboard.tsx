'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Users,
  UserCheck,
  FileText,
  Activity,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Shield,
  Ticket
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  managers: number;
  dsps: number;
  clients: number;
  supportTickets: {
    open: number;
    inProgress: number;
    total: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    managers: 0,
    dsps: 0,
    clients: 0,
    supportTickets: {
      open: 0,
      inProgress: 0,
      total: 0
    }
  });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  
  // DSP-Manager Assignment states
  const [dspManagerAssignments, setDspManagerAssignments] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDspId, setSelectedDspId] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [dsps, setDsps] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load data with individual error handling
      const [allUsers, managersData, dspsData, clients, tickets, ticketStats, assignments] = await Promise.all([
        api.getOrganizationUsers().catch(() => []),
        api.getOrganizationUsers('manager').catch(() => []),
        api.getOrganizationUsers('dsp').catch(() => []),
        api.getClients().catch(() => []),
        api.getSupportTickets({ status: 'open' }).catch(() => []),
        api.getSupportTicketStats().catch(() => ({ open: 0, inProgress: 0, total: 0 })),
        api.getDspManagerAssignments().catch(() => [])
      ]);

      setStats({
        totalUsers: Array.isArray(allUsers) ? allUsers.length : 0,
        managers: Array.isArray(managersData) ? managersData.length : 0,
        dsps: Array.isArray(dspsData) ? dspsData.length : 0,
        clients: Array.isArray(clients) ? clients.length : 0,
        supportTickets: ticketStats
      });
      setRecentTickets(Array.isArray(tickets) ? tickets.slice(0, 5) : []);
      setDspManagerAssignments(Array.isArray(assignments) ? assignments : []);
      setDsps(Array.isArray(dspsData) ? dspsData : []);
      setManagers(Array.isArray(managersData) ? managersData : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        managers: 0,
        dsps: 0,
        clients: 0,
        supportTickets: { open: 0, inProgress: 0, total: 0 }
      });
      setRecentTickets([]);
      setDspManagerAssignments([]);
      setDsps([]);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await api.createDspManagerAssignment({
        dspId: selectedDspId,
        managerId: selectedManagerId
      });
      setShowAssignModal(false);
      setSelectedDspId('');
      setSelectedManagerId('');
      loadDashboardData(); // Refresh
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('Failed to create assignment. Please try again.');
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    if (confirm('Remove this DSP-Manager assignment?')) {
      try {
        await api.removeDspManagerAssignment(id);
        loadDashboardData(); // Refresh
      } catch (error) {
        console.error('Failed to remove assignment:', error);
        alert('Failed to remove assignment. Please try again.');
      }
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
        <p className="text-gray-600 mt-1">Organization Administrator</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => router.push('/dashboard/admin/managers')}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Managers</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.managers}</p>
            </div>
            <Users className="w-10 h-10 text-indigo-600 opacity-20" />
          </div>
        </div>

        <div 
          onClick={() => router.push('/dashboard/admin/dsps')}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">DSP Staff</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.dsps}</p>
            </div>
            <UserCheck className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div 
          onClick={() => router.push('/dashboard/clients')}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.clients}</p>
            </div>
            <Users className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div 
          onClick={() => router.push('/dashboard/admin/tickets')}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Support Tickets</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.supportTickets.open}</p>
              <p className="text-xs text-gray-500 mt-1">Open tickets</p>
            </div>
            <Ticket className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Overview */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Staff Overview
            </h2>
            <button
              onClick={() => router.push('/dashboard/admin/managers')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Manage
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.managers}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard/admin/managers')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">DSP Staff</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.dsps}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard/admin/dsps')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => router.push('/dashboard/admin/managers')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-lg transition-colors border border-indigo-200"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-indigo-600" />
                <span className="font-medium text-gray-900">Manage Managers</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/dashboard/admin/dsps')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg transition-colors border border-blue-200"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900">DSP Allocation</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/dashboard/admin/records')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-colors border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-900">View Records</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/dashboard/admin/audit')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-colors border border-orange-200"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-orange-600" />
                <span className="font-medium text-gray-900">Audit Logs</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* DSP to Manager Assignments */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            DSP to Manager Assignments
          </h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Assign DSP to Manager
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {dspManagerAssignments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No DSP-Manager assignments yet</p>
            </div>
          ) : (
            dspManagerAssignments.map((assignment: any) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600">DSP</p>
                        <p className="font-semibold text-gray-900">
                          {assignment.dsp.firstName} {assignment.dsp.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{assignment.dsp.email}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Manager</p>
                        <p className="font-semibold text-gray-900">
                          {assignment.manager.firstName} {assignment.manager.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{assignment.manager.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-orange-600" />
            Recent Support Tickets
          </h2>
          <button
            onClick={() => router.push('/dashboard/admin/tickets')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No open support tickets</p>
            </div>
          ) : (
            recentTickets.map((ticket: any) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.description?.substring(0, 100)}
                      {ticket.description?.length > 100 && '...'}
                    </p>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority} priority
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {ticket.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/admin/tickets`)}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md border border-green-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Healthy</span>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Assign DSP to Manager</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select DSP
                </label>
                <select
                  value={selectedDspId}
                  onChange={(e) => setSelectedDspId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose DSP --</option>
                  {dsps.map(dsp => (
                    <option key={dsp.id} value={dsp.id}>
                      {dsp.firstName} {dsp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Manager
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose Manager --</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDspId('');
                  setSelectedManagerId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                disabled={!selectedDspId || !selectedManagerId}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
