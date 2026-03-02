'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, Plus, UserPlus, Edit, Trash2, CheckCircle, Calendar, ClipboardList } from 'lucide-react';

export default function ManagerClientAssignmentsPage() {
  const [dsps, setDsps] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  
  const [assignForm, setAssignForm] = useState({
    dspId: '',
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    notes: ''
  });

  const [taskForm, setTaskForm] = useState({
    dspId: '',
    clientId: '',
    title: '',
    description: '',
    taskType: 'care_plan',
    priority: 'medium',
    dueDate: '',
    estimatedHours: '2'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dspsData, clientsData] = await Promise.all([
        api.getOrganizationUsers('dsp'),
        api.getClients()
      ]);
      
      setDsps(dspsData);
      setClients(clientsData);
      
      // Load assignments from API
      const assignmentsData = await api.getClientAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClientAssignment(assignForm);
      
      setShowAssignModal(false);
      setAssignForm({
        dspId: '',
        clientId: '',
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadData();
      alert('Client assigned successfully!');
    } catch (error) {
      console.error('Error assigning client:', error);
      alert('Failed to assign client. Please try again.');
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to unassign this client from the DSP?')) return;
    
    try {
      await api.removeClientAssignment(assignmentId);
      loadData();
      alert('Client unassigned successfully!');
    } catch (error) {
      console.error('Error unassigning client:', error);
      alert('Failed to unassign client.');
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClient(clientForm);
      
      setShowClientModal(false);
      setClientForm({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalInfo: '',
        notes: ''
      });
      loadData();
      alert('Client created successfully!');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask({
        ...taskForm,
        assignedTo: taskForm.dspId,
        estimatedHours: parseFloat(taskForm.estimatedHours)
      });
      
      setShowTaskModal(false);
      setTaskForm({
        dspId: '',
        clientId: '',
        title: '',
        description: '',
        taskType: 'care_plan',
        priority: 'medium',
        dueDate: '',
        estimatedHours: '2'
      });
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const getDspAssignments = (dspId: string) => {
    return assignments.filter(a => a.dspId === dspId || a.userId === dspId);
  };

  const getClientForAssignment = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Assignments</h1>
            <p className="text-gray-600 mt-1">Assign clients to DSPs and manage their workload</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowClientModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Client</span>
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>Assign Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total DSPs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dsps.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{clients.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{assignments.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unassigned Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {clients.length - assignments.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* DSPs with Client Assignments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">DSP Client Assignments</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        ) : dsps.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No DSPs available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {dsps.map((dsp) => {
              const dspAssignments = getDspAssignments(dsp.id);
              return (
                <div key={dsp.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {dsp.firstName[0]}{dsp.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dsp.firstName} {dsp.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {dspAssignments.length} client{dspAssignments.length !== 1 ? 's' : ''} assigned
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setTaskForm({ ...taskForm, dspId: dsp.id });
                          setShowTaskModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span className="text-sm">Create Task</span>
                      </button>
                    </div>
                  </div>

                  {dspAssignments.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                      No clients assigned yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dspAssignments.map((assignment) => {
                        const client = getClientForAssignment(assignment.clientId);
                        if (!client) return null;
                        
                        return (
                          <div
                            key={assignment.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {client.firstName} {client.lastName}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Assigned: {new Date(assignment.startDate || assignment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleUnassign(assignment.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Unassign client"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {assignment.notes && (
                              <p className="text-xs text-gray-600 mt-2">{assignment.notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Client Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Assign Client to DSP</h2>
            
            <form onSubmit={handleAssignClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DSP *
                </label>
                <select
                  required
                  value={assignForm.dspId}
                  onChange={(e) => setAssignForm({ ...assignForm, dspId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select DSP...</option>
                  {dsps.map(dsp => (
                    <option key={dsp.id} value={dsp.id}>
                      {dsp.firstName} {dsp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  required
                  value={assignForm.clientId}
                  onChange={(e) => setAssignForm({ ...assignForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={assignForm.startDate}
                  onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Client</h2>
            
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.firstName}
                    onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.lastName}
                    onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={clientForm.dateOfBirth}
                  onChange={(e) => setClientForm({ ...clientForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full address for location verification"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={clientForm.emergencyContact}
                    onChange={(e) => setClientForm({ ...clientForm, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={clientForm.emergencyPhone}
                    onChange={(e) => setClientForm({ ...clientForm, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Information
                </label>
                <textarea
                  value={clientForm.medicalInfo}
                  onChange={(e) => setClientForm({ ...clientForm, medicalInfo: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Allergies, medications, conditions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create Task for DSP</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DSP
                </label>
                <select
                  required
                  value={taskForm.dspId}
                  onChange={(e) => setTaskForm({ ...taskForm, dspId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select DSP...</option>
                  {dsps.map(dsp => (
                    <option key={dsp.id} value={dsp.id}>
                      {dsp.firstName} {dsp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client (Optional)
                </label>
                <select
                  value={taskForm.clientId}
                  onChange={(e) => setTaskForm({ ...taskForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Complete progress note"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Task details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type
                  </label>
                  <select
                    value={taskForm.taskType}
                    onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="care_plan">Care Plan</option>
                    <option value="progress_note">Progress Note</option>
                    <option value="assessment">Assessment</option>
                    <option value="documentation">Documentation</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
