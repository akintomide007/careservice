'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, Clock, Plus, MapPin, User, AlertCircle } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    address?: string;
  };
  serviceType?: string;
  location?: string;
  notes?: string;
}

export default function DSPSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [requestForm, setRequestForm] = useState({
    clientId: '',
    appointmentType: 'home_visit',
    preferredDate: '',
    preferredTime: '',
    duration: '60',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadSchedules();
    loadClients();
  }, [selectedDate]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setDate(1);
      const endDate = new Date(selectedDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      const data = await api.getUserSchedules(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const preferredDateTime = `${requestForm.preferredDate}T${requestForm.preferredTime}`;
      
      await api.request('/api/appointment-requests', {
        method: 'POST',
        body: JSON.stringify({
          clientId: requestForm.clientId,
          appointmentType: requestForm.appointmentType,
          urgency: 'routine',
          reason: requestForm.reason,
          notes: requestForm.notes,
          preferredDates: [preferredDateTime],
          estimatedDuration: parseInt(requestForm.duration),
        }),
      });

      setShowRequestModal(false);
      setRequestForm({
        clientId: '',
        appointmentType: 'home_visit',
        preferredDate: '',
        preferredTime: '',
        duration: '60',
        reason: '',
        notes: ''
      });
      alert('Appointment request submitted successfully!');
      loadSchedules();
    } catch (error) {
      console.error('Error requesting appointment:', error);
      alert('Failed to submit appointment request');
    }
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getSchedulesForDate = (day: number) => {
    if (!day) return [];
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
      .toISOString().split('T')[0];
    return schedules.filter(s => s.date?.startsWith(dateStr) || s.startTime?.startsWith(dateStr));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">View your appointments and request new ones</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Request Appointment</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {getDaysInMonth().map((day, index) => {
            const daySchedules = day ? getSchedulesForDate(day) : [];
            const isToday = day === new Date().getDate() &&
              selectedDate.getMonth() === new Date().getMonth() &&
              selectedDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="text-xs bg-blue-100 text-blue-800 rounded p-1 cursor-pointer hover:bg-blue-200"
                          title={`${schedule.title} - ${schedule.startTime} to ${schedule.endTime}`}
                        >
                          <div className="font-medium truncate">{schedule.title || 'Appointment'}</div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{schedule.startTime?.split('T')[1]?.substring(0, 5) || 'TBD'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments List */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Upcoming Appointments
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : schedules.filter(s => new Date(s.date || s.startTime) >= new Date()).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules
              .filter(s => new Date(s.date || s.startTime) >= new Date())
              .sort((a, b) => new Date(a.date || a.startTime).getTime() - new Date(b.date || b.startTime).getTime())
              .slice(0, 5)
              .map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                    {schedule.client && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <User className="w-4 h-4 mr-1" />
                        {schedule.client.firstName} {schedule.client.lastName}
                      </div>
                    )}
                    {schedule.location && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {schedule.location}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(schedule.date || schedule.startTime).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-end">
                      <Clock className="w-4 h-4 mr-1" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Request Appointment Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Request Appointment</h2>
            
            <form onSubmit={handleRequestAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  required
                  value={requestForm.clientId}
                  onChange={(e) => setRequestForm({ ...requestForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type *
                </label>
                <select
                  required
                  value={requestForm.appointmentType}
                  onChange={(e) => setRequestForm({ ...requestForm, appointmentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="home_visit">Home Visit</option>
                  <option value="medical">Medical Appointment</option>
                  <option value="therapy">Therapy Session</option>
                  <option value="social">Social Activity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={requestForm.preferredDate}
                    onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={requestForm.preferredTime}
                    onChange={(e) => setRequestForm({ ...requestForm, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={requestForm.duration}
                  onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Appointment *
                </label>
                <textarea
                  required
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the purpose of this appointment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Your appointment request will be sent to your manager for approval.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestForm({
                      clientId: '',
                      appointmentType: 'home_visit',
                      preferredDate: '',
                      preferredTime: '',
                      duration: '60',
                      reason: '',
                      notes: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
