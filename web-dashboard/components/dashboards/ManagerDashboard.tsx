'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Users,
  FileCheck,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Activity,
  ChevronRight,
  Clock,
  TrendingUp,
  UserCheck,
  FileEdit,
  AlertCircle,
  BarChart3
} from 'lucide-react';

// TypeScript Interfaces
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface ProgressNote {
  id: string;
  status: string;
  client?: {
    firstName: string;
    lastName: string;
  };
  submittedBy?: {
    firstName: string;
    lastName: string;
  };
  submittedAt: string;
  createdAt: string;
}

interface FormResponse {
  id: string;
  status: string;
  template?: {
    name: string;
    formType: string;
  };
  submittedBy?: {
    firstName: string;
    lastName: string;
  };
  submittedAt: string;
  createdAt: string;
}

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  serviceType?: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  client?: {
    firstName: string;
    lastName: string;
  };
  date: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  dueDate?: string;
}

interface Incident {
  id: string;
  severity: string;
  status: string;
  description: string;
  client?: {
    firstName: string;
    lastName: string;
  };
  reportedBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  byPriority?: {
    high: number;
    medium: number;
    low: number;
  };
}

interface DashboardStats {
  staffCount: number;
  pendingProgressNotes: ProgressNote[];
  pendingForms: FormResponse[];
  todaySchedules: Schedule[];
  taskStats: TaskStatistics;
  recentIncidents: Incident[];
  assignedTasks: Task[];
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    staffCount: 0,
    pendingProgressNotes: [],
    pendingForms: [],
    todaySchedules: [],
    taskStats: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    },
    recentIncidents: [],
    assignedTasks: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        staff,
        progressNotes,
        forms,
        schedules,
        taskStatistics,
        incidents,
        tasks
      ] = await Promise.all([
        api.getOrganizationUsers('dsp').catch(() => []),
        api.getProgressNotes({ status: 'submitted' }).catch(() => []),
        api.getSubmittedFormResponses().catch(() => []),
        api.getOrganizationSchedules({ startDate: today, endDate: today }).catch(() => []),
        api.getTaskStatistics().catch(() => ({
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0
        })),
        api.getIncidents({ status: 'pending' }).catch(() => []),
        api.getAssignedTasks({ status: 'pending' }).catch(() => [])
      ]);

      setStats({
        staffCount: staff.length || 0,
        pendingProgressNotes: progressNotes || [],
        pendingForms: forms.filter((f: FormResponse) => f.status === 'submitted') || [],
        todaySchedules: schedules || [],
        taskStats: taskStatistics,
        recentIncidents: incidents.slice(0, 5) || [],
        assignedTasks: tasks || []
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProgressNote = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.approveProgressNote(id, action);
      await loadDashboardData();
    } catch (error: any) {
      alert('Failed to process approval: ' + error.message);
    }
  };

  const handleApproveForm = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.approveFormResponse(id, action);
      await loadDashboardData();
    } catch (error: any) {
      alert('Failed to process approval: ' + error.message);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Team oversight and approvals</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/manager/team')}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>Manage Team</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Staff Count */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.staffCount}</p>
              <p className="text-xs text-gray-500 mt-1">Active DSPs</p>
            </div>
            <UserCheck className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {stats.pendingProgressNotes.length + stats.pendingForms.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingProgressNotes.length} notes, {stats.pendingForms.length} forms
              </p>
            </div>
            <FileCheck className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Shifts</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.todaySchedules.length}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled today</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-600 opacity-20" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.taskStats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.taskStats.overdue} overdue
              </p>
            </div>
            <CheckSquare className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Task Statistics
          </h2>
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.taskStats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.taskStats.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.taskStats.inProgress}</p>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.taskStats.completed}</p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.taskStats.overdue}</p>
              <p className="text-sm text-gray-600 mt-1">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Progress Notes */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileEdit className="w-5 h-5 mr-2 text-orange-600" />
              Pending Progress Notes
            </h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {stats.pendingProgressNotes.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {stats.pendingProgressNotes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileEdit className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No pending progress notes</p>
              </div>
            ) : (
              stats.pendingProgressNotes.map((note) => (
                <div key={note.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {note.client?.firstName} {note.client?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        By {note.submittedBy?.firstName} {note.submittedBy?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.submittedAt || note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveProgressNote(note.id, 'approve')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveProgressNote(note.id, 'reject')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Forms */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
              Pending Forms
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {stats.pendingForms.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {stats.pendingForms.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No pending forms</p>
              </div>
            ) : (
              stats.pendingForms.map((form) => (
                <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {form.template?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        By {form.submittedBy?.firstName} {form.submittedBy?.lastName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {form.template?.formType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(form.submittedAt || form.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveForm(form.id, 'approve')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveForm(form.id, 'reject')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule Overview */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Today's Team Schedule
          </h2>
          <button
            onClick={() => router.push('/dashboard/manager/schedule')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View Full Schedule
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {stats.todaySchedules.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No scheduled shifts for today</p>
            </div>
          ) : (
            stats.todaySchedules.map((schedule) => (
              <div key={schedule.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {schedule.user?.firstName} {schedule.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          with {schedule.client?.firstName} {schedule.client?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                      {schedule.serviceType && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {schedule.serviceType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Recent Incidents Requiring Attention
          </h2>
          <button
            onClick={() => router.push('/dashboard/violations')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentIncidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent incidents</p>
            </div>
          ) : (
            stats.recentIncidents.map((incident) => (
              <div key={incident.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mt-2">{incident.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                      {incident.client && (
                        <span>
                          Client: {incident.client.firstName} {incident.client.lastName}
                        </span>
                      )}
                      {incident.reportedBy && (
                        <span>
                          Reported by: {incident.reportedBy.firstName} {incident.reportedBy.lastName}
                        </span>
                      )}
                      <span>{new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
