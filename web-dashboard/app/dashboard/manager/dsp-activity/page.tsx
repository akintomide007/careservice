'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, User, MapPin, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DspActivityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dsps, setDsps] = useState<any[]>([]);
  const [selectedDsp, setSelectedDsp] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDsp, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load only DSPs assigned to this manager
      const assignedDsps = await api.getMyAssignedDsps();
      setDsps(assignedDsps);

      // Load sessions based on filters
      const filters: any = {};
      if (selectedDsp !== 'all') {
        filters.staffId = selectedDsp;
      }

      // Get sessions data
      const sessionsData = await api.getSessions(filters);
      
      // Filter sessions to only show those from assigned DSPs
      const assignedDspIds = new Set(assignedDsps.map((dsp: any) => dsp.id));
      const filteredByAssignment = sessionsData.filter((session: any) => 
        assignedDspIds.has(session.staffId)
      );
      
      // Filter by date range
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      const filteredSessions = filteredByAssignment.filter((session: any) => {
        const sessionDate = new Date(session.clockInTime);
        return sessionDate >= cutoffDate;
      });

      // Sort by most recent first
      filteredSessions.sort((a: any, b: any) => 
        new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime()
      );

      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error loading DSP activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) {
      const now = new Date();
      const start = new Date(clockIn);
      const diff = now.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m (In Progress)`;
    }
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredSessions = sessions.filter(session => {
    if (searchTerm === '') return true;
    
    const staffName = `${session.staff?.firstName} ${session.staff?.lastName}`.toLowerCase();
    const clientName = `${session.client?.firstName} ${session.client?.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return staffName.includes(search) || clientName.includes(search);
  });

  // Calculate statistics
  const totalHours = sessions.reduce((sum, s) => sum + (s.totalHours || 0), 0);
  const activeSessions = sessions.filter(s => !s.clockOutTime).length;
  const completedSessions = sessions.filter(s => s.clockOutTime).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">DSP Activity Log</h1>
        <p className="text-gray-600 mt-1">Monitor DSP clock-in/clock-out times and service sessions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">{activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by DSP or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* DSP Filter */}
          <div>
            <select
              value={selectedDsp}
              onChange={(e) => setSelectedDsp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All DSPs</option>
              {dsps.map(dsp => (
                <option key={dsp.id} value={dsp.id}>
                  {dsp.firstName} {dsp.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
            <p>No sessions match your selected filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(session.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${session.clockOutTime ? 'bg-gray-100' : 'bg-green-100'}`}>
                        <User className={`w-5 h-5 ${session.clockOutTime ? 'text-gray-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.staff?.firstName} {session.staff?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Client: {session.client?.firstName} {session.client?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {calculateDuration(session.clockInTime, session.clockOutTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.serviceType?.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(session.clockInTime).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.clockInTime).toLocaleTimeString()}
                      </p>
                    </div>

                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      session.clockOutTime 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.clockOutTime ? 'Completed' : 'In Progress'}
                    </span>

                    {expandedSessions.has(session.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSessions.has(session.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Clock In Details */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Clock In
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Time:</span>
                            <span className="font-medium text-green-900">
                              {new Date(session.clockInTime).toLocaleString()}
                            </span>
                          </div>
                          {session.clockInLat && session.clockInLng && (
                            <div className="flex justify-between">
                              <span className="text-green-700">Location:</span>
                              <span className="font-medium text-green-900">
                                {session.clockInLat.toFixed(4)}, {session.clockInLng.toFixed(4)}
                              </span>
                            </div>
                          )}
                          {session.locationName && (
                            <div className="flex justify-between">
                              <span className="text-green-700">Address:</span>
                              <span className="font-medium text-green-900">{session.locationName}</span>
                            </div>
                          )}
                          {session.locationVerified !== null && (
                            <div className="flex justify-between">
                              <span className="text-green-700">Verified:</span>
                              <span className={`font-medium ${session.locationVerified ? 'text-green-900' : 'text-red-600'}`}>
                                {session.locationVerified ? '✓ Yes' : '✗ No'}
                              </span>
                            </div>
                          )}
                          {session.distanceFromClient !== null && (
                            <div className="flex justify-between">
                              <span className="text-green-700">Distance:</span>
                              <span className="font-medium text-green-900">
                                {session.distanceFromClient}m from client
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Clock Out Details */}
                      {session.clockOutTime ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Clock Out
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Time:</span>
                              <span className="font-medium text-gray-900">
                                {new Date(session.clockOutTime).toLocaleString()}
                              </span>
                            </div>
                            {session.clockOutLat && session.clockOutLng && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Location:</span>
                                <span className="font-medium text-gray-900">
                                  {session.clockOutLat.toFixed(4)}, {session.clockOutLng.toFixed(4)}
                                </span>
                              </div>
                            )}
                            {session.totalHours && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Duration:</span>
                                <span className="font-medium text-gray-900">
                                  {session.totalHours.toFixed(2)} hours
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-700">Status:</span>
                              <span className="font-medium text-gray-900 capitalize">
                                {session.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Session In Progress
                          </h4>
                          <p className="text-sm text-yellow-700">
                            DSP has not clocked out yet. Session duration is being calculated in real-time.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Verification Message */}
                    {session.verificationMessage && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          <strong>Verification:</strong> {session.verificationMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
