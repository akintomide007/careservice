'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, Clock, MapPin, User, Plus, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import SpeechToTextInput from '@/components/SpeechToTextInput';

export default function ManagerSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    clientId: '',
    title: '',
    shiftType: 'work',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    taskType: 'progress_note',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [schedulesData, usersData, clientsData] = await Promise.all([
        api.getOrganizationSchedules({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        api.getOrganizationUsers('dsp'),
        api.getClients()
      ]);
      
      setSchedules(schedulesData);
      setUsers(usersData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getSchedulesForDate = (date: Date | null) => {
    if (!date) return [];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      startTime: `${dateStr}T09:00`,
      endTime: `${dateStr}T17:00`
    }));
    setShowCreateModal(true);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSchedule(formData);
      setShowCreateModal(false);
      setFormData({
        userId: '',
        clientId: '',
        title: '',
        shiftType: 'work',
        startTime: '',
        endTime: '',
        location: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.deleteSchedule(id);
      loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600 mt-1">Assign schedules to DSPs by clicking on calendar days</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">{monthYear}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const daySchedules = getSchedulesForDate(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all ${
                      date
                        ? isToday
                          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-right mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {daySchedules.slice(0, 3).map(schedule => (
                            <div
                              key={schedule.id}
                              className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {schedule.user.firstName} - {schedule.shiftType}
                            </div>
                          ))}
                          {daySchedules.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{daySchedules.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Schedule for {selectedDate?.toLocaleDateString()}</h2>
            
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DSP Staff *
                  </label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select DSP</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Morning Shift"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Type *
                </label>
                <select
                  required
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="work">Work</option>
                  <option value="training">Training</option>
                  <option value="meeting">Meeting</option>
                  <option value="time_off">Time Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Client Home, Office"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <SpeechToTextInput
                  value={formData.notes}
                  onChange={(val) => setFormData({ ...formData, notes: val })}
                  multiline
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
