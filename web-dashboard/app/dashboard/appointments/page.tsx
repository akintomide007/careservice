'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import SpeechToTextInput from '@/components/SpeechToTextInput';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dddId: string;
}

interface AppointmentRequest {
  id: string;
  client: Client;
  requester: {
    firstName: string;
    lastName: string;
    role: string;
  };
  appointmentType: string;
  urgency: string;
  reason: string;
  notes?: string;
  preferredDates: string[];
  location?: string;
  provider?: string;
  status: string;
  createdAt: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
  reviewNotes?: string;
  scheduledDate?: string;
}

export default function AppointmentsPage() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [user, setUser] = useState<any>({});
  const [token, setToken] = useState<string>('');
  
  // DSP Assignment states
  const [availableDsps, setAvailableDsps] = useState<any[]>([]);
  const [loadingDsps, setLoadingDsps] = useState(false);
  const [selectedDspId, setSelectedDspId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    appointmentType: 'medical',
    urgency: 'routine',
    reason: '',
    notes: '',
    preferredDates: [''],
    location: '',
    provider: '',
    providerPhone: '',
    transportation: 'self',
  });

  useEffect(() => {
    // Access localStorage only on the client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      setUser(storedUser ? JSON.parse(storedUser) : {});
      setToken(storedToken || '');
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchRequests();
      fetchClients();
    }
  }, [filter, token]);

  const fetchRequests = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/appointment-requests'
        : `/api/appointment-requests?status=${filter}`;
        
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/appointment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          preferredDates: formData.preferredDates.filter(d => d),
        }),
      });

      if (response.ok) {
        setShowRequestForm(false);
        fetchRequests();
        setFormData({
          clientId: '',
          appointmentType: 'medical',
          urgency: 'routine',
          reason: '',
          notes: '',
          preferredDates: [''],
          location: '',
          provider: '',
          providerPhone: '',
          transportation: 'self',
        });
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    const scheduledDate = (document.getElementById('scheduledDate') as HTMLInputElement)?.value;
    const reviewNotes = (document.getElementById('reviewNotes') as HTMLTextAreaElement)?.value;
    const createSchedule = (document.getElementById('createSchedule') as HTMLInputElement)?.checked;
    const duration = (document.getElementById('duration') as HTMLInputElement)?.value || '60';

    if (!scheduledDate) {
      alert('Please select a date and time for the appointment');
      return;
    }

    try {
      // First approve the appointment
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/appointment-requests/${selectedRequest.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduledDate,
            reviewNotes,
            createSchedule,
            scheduleData: createSchedule ? {
              userId: selectedDspId || selectedRequest.requester.firstName,
              title: `${selectedRequest.appointmentType} - ${selectedRequest.client.firstName} ${selectedRequest.client.lastName}`,
              location: selectedRequest.location,
            } : undefined,
          }),
        }
      );

      if (response.ok) {
        const approved = await response.json();
        
        // If a DSP was selected, assign them to the appointment
        if (selectedDspId) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/appointment-requests/${approved.id}/assign-dsp`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ dspId: selectedDspId }),
              }
            );
          } catch (assignError) {
            console.error('Error assigning DSP:', assignError);
            // Continue even if DSP assignment fails
          }
        }
        
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setAvailableDsps([]);
        setSelectedDspId(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve appointment. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    const reviewNotes = (document.getElementById('rejectNotes') as HTMLTextAreaElement)?.value;
    if (!reviewNotes) {
      alert('Please provide rejection notes');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/appointment-requests/${selectedRequest.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reviewNotes }),
        }
      );

      if (response.ok) {
        setShowApprovalModal(false);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Fetch available DSPs when date/time changes
  const handleDateChange = async () => {
    if (!selectedRequest) return;
    
    const scheduledDate = (document.getElementById('scheduledDate') as HTMLInputElement)?.value;
    const duration = (document.getElementById('duration') as HTMLInputElement)?.value || '60';
    
    if (!scheduledDate) {
      setAvailableDsps([]);
      return;
    }

    setLoadingDsps(true);
    try {
      const params = new URLSearchParams({
        start: new Date(scheduledDate).toISOString(),
        duration: duration,
        clientId: selectedRequest.client.id,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/appointment-requests/available-dsps?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableDsps(data);
        // Auto-select the highest scored available DSP
        const bestDsp = data.find((d: any) => d.available);
        if (bestDsp) {
          setSelectedDspId(bestDsp.dsp.id);
        }
      }
    } catch (error) {
      console.error('Error fetching available DSPs:', error);
    } finally {
      setLoadingDsps(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: Record<string, string> = {
      routine: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[urgency]}`}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </button>
        </div>
        <p className="mt-2 text-gray-600">Manage client appointment requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-3 py-1 rounded ${filter === 'scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Scheduled
        </button>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.client.firstName} {request.client.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{request.client.dddId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.appointmentType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getUrgencyBadge(request.urgency)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{request.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.status === 'pending' && (user.role === 'manager' || user.role === 'admin') && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowApprovalModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Review
                    </button>
                  )}
                  {request.status !== 'pending' && (
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">New Appointment Request</h2>
            <form onSubmit={handleSubmitRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} ({client.dddId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                    <select
                      value={formData.appointmentType}
                      onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      required
                    >
                      <option value="medical">Medical</option>
                      <option value="therapy">Therapy</option>
                      <option value="dental">Dental</option>
                      <option value="social">Social Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      required
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <SpeechToTextInput
                    value={formData.reason}
                    onChange={(val) => setFormData({ ...formData, reason: val })}
                    className="mt-1"
                    multiline
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferredDates[0]}
                    onChange={(e) => setFormData({ ...formData, preferredDates: [e.target.value] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Transportation</label>
                  <select
                    value={formData.transportation}
                    onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="self">Self</option>
                    <option value="family">Family</option>
                    <option value="needs_transport">Needs Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                  <SpeechToTextInput
                    value={formData.notes}
                    onChange={(val) => setFormData({ ...formData, notes: val })}
                    className="mt-1"
                    multiline
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal with DSP Assignment */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Review & Schedule Appointment</h2>
            
            <div className="space-y-4 mb-6">
              {/* Client Info */}
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{selectedRequest.client.firstName} {selectedRequest.client.lastName}</p>
                  <p className="text-xs text-gray-500">{selectedRequest.client.dddId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{selectedRequest.appointmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgency</p>
                  {getUrgencyBadge(selectedRequest.urgency)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested By</p>
                  <p className="font-medium">{selectedRequest.requester.firstName} {selectedRequest.requester.lastName}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-medium">Reason</p>
                <p className="mt-1 text-gray-800">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.provider && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Provider</p>
                  <p className="mt-1">{selectedRequest.provider}</p>
                </div>
              )}

              {selectedRequest.location && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Location</p>
                  <p className="mt-1">{selectedRequest.location}</p>
                </div>
              )}

              {/* Scheduling Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Schedule Appointment</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      onChange={handleDateChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      defaultValue="60"
                      min="15"
                      step="15"
                      onChange={handleDateChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* DSP Assignment Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Assign DSP</h3>
                
                {loadingDsps ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading available DSPs...</span>
                  </div>
                ) : availableDsps.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableDsps.map((suggestion) => (
                      <div
                        key={suggestion.dsp.id}
                        onClick={() => !suggestion.conflicts && setSelectedDspId(suggestion.dsp.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedDspId === suggestion.dsp.id
                            ? 'border-blue-500 bg-blue-50'
                            : suggestion.available
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {suggestion.dsp.firstName} {suggestion.dsp.lastName}
                              </p>
                              {suggestion.available ? (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                  Available
                                </span>
                              ) : (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                  Unavailable
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{suggestion.dsp.email}</p>
                            
                            {suggestion.available && suggestion.reasons.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {suggestion.reasons.map((reason: string, idx: number) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                    <span className="text-blue-500">✓</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            {!suggestion.available && suggestion.reasons.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {suggestion.reasons.map((reason: string, idx: number) => (
                                  <li key={idx} className="text-xs text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          
                          {suggestion.available && (
                            <div className="ml-2">
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">{suggestion.score}</p>
                                <p className="text-xs text-gray-500">Match Score</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select a date and time to see available DSPs</p>
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="createSchedule"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">Create calendar event</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendReminders"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">Send reminders to client and DSP</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (Optional)</label>
                <textarea
                  id="reviewNotes"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add any notes about this scheduling decision"
                />
              </div>

              {/* Rejection Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (only if rejecting)
                </label>
                <textarea
                  id="rejectNotes"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  placeholder="Explain why this appointment request is being rejected"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                  setAvailableDsps([]);
                  setSelectedDspId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject Request
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve & Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
