'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  FileEdit,
  Clock,
  CheckSquare,
  Calendar,
  Users,
  Activity,
  Plus,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function DspDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [assignedClients, setAssignedClients] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todaySchedule: [] as any[],
    pendingTasks: [] as any[],
    draftForms: [] as any[],
    activeSession: null as any
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [schedules, tasks, drafts, session, clients] = await Promise.all([
        api.getUserSchedules(today, today),
        api.getTasks({ status: 'pending' }),
        api.getFormResponses('draft'),
        api.getActiveSession(),
        api.getAssignedClients()
      ]);

      setAssignedClients(clients || []);
      setStats({
        todaySchedule: schedules,
        pendingTasks: tasks,
        draftForms: drafts,
        activeSession: Array.isArray(session) && session.length > 0 ? session[0] : null
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (clientId: string, serviceType: string) => {
    try {
      // Get current location
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please use a modern browser to clock in.');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      // Clock in with location data
      const session = await api.clockIn({
        clientId,
        serviceType,
        latitude,
        longitude,
        locationName: 'Mobile Location'
      });
      
      setShowClockInModal(false);
      await loadDashboardData();
      
      // Show success message with verification status
      if (session.verificationMessage) {
        alert(`✓ Successfully clocked in!\n\n${session.verificationMessage}`);
      } else {
        alert('✓ Successfully clocked in!');
      }
    } catch (error: any) {
      if (error.code) {
        // Geolocation error
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('❌ Location permission denied.\n\nPlease enable location services to clock in.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('❌ Location information unavailable.\n\nPlease try again.');
            break;
          case error.TIMEOUT:
            alert('❌ Location request timed out.\n\nPlease try again.');
            break;
          default:
            alert('❌ An unknown error occurred while getting your location.');
        }
      } else {
        alert('❌ Failed to clock in:\n\n' + error.message);
      }
    }
  };

  const handleClockOut = async () => {
    try {
      await api.clockOut();
      await loadDashboardData();
    } catch (error: any) {
      alert('Failed to clock out: ' + error.message);
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
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Direct Support Professional</p>
        </div>
        {stats.activeSession ? (
          <button
            onClick={handleClockOut}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg transition-colors"
          >
            <Clock className="w-5 h-5" />
            <span>Clock Out</span>
          </button>
        ) : (
          <button
            onClick={() => setShowClockInModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg transition-colors"
          >
            <Clock className="w-5 h-5" />
            <span>Clock In</span>
          </button>
        )}
      </div>

      {/* Clock In Modal */}
      {showClockInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Clock In</h3>
              <p className="text-sm text-gray-600 mt-1">Select client and service type</p>
            </div>
            <div className="p-6 space-y-4">
              {assignedClients.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No assigned clients found.</p>
                  <p className="text-sm text-gray-500 mt-1">Please contact your manager.</p>
                </div>
              ) : (
                assignedClients.map((client: any) => (
                  <button
                    key={client.id}
                    onClick={() => handleClockIn(client.id, 'community_based_support')}
                    className="w-full text-left p-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                          {client.firstName} {client.lastName}
                        </p>
                        {client.address && (
                          <p className="text-sm text-gray-600 mt-1">{client.address}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowClockInModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Session Alert */}
      {stats.activeSession && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Currently Clocked In</p>
                <p className="text-sm text-green-700">
                  Started at {new Date(stats.activeSession.clockInTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/forms')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Form</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Schedule</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.todaySchedule.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingTasks.length}</p>
            </div>
            <CheckSquare className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft Forms</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.draftForms.length}</p>
            </div>
            <FileEdit className="w-10 h-10 text-yellow-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {stats.activeSession ? 'Clocked In' : 'Clocked Out'}
              </p>
            </div>
            <Activity className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/reports')}
              className="flex items-center space-x-4 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">Reports</h3>
                <p className="text-sm text-gray-600">View and generate reports</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Today's Schedule
          </h2>
          <button
            onClick={() => router.push('/dashboard/schedules')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.todaySchedule.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No scheduled shifts for today</p>
            </div>
          ) : (
            stats.todaySchedule.map((schedule: any) => (
              <div key={schedule.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {schedule.client?.firstName} {schedule.client?.lastName}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {schedule.serviceType || 'General Care'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-orange-600" />
            Pending Tasks
          </h2>
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.pendingTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No pending tasks</p>
            </div>
          ) : (
            stats.pendingTasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-2">
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority} priority
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

      {/* Draft Forms */}
      {stats.draftForms.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileEdit className="w-5 h-5 mr-2 text-yellow-600" />
              Draft Forms
            </h2>
            <button
              onClick={() => router.push('/forms')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.draftForms.slice(0, 3).map((draft: any) => (
              <div key={draft.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{draft.template?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Last updated: {new Date(draft.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/forms?draft=${draft.id}`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
