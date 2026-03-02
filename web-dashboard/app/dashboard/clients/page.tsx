'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import SpeechToTextInput from '@/components/SpeechToTextInput';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  Phone,
  Activity
} from 'lucide-react';

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  
  // DSP selection for client creation
  const [availableDsps, setAvailableDsps] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dddId: '',
    dateOfBirth: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    isActive: true,
    dspId: ''
  });

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    loadClients();
    loadAvailableDsps();
  }, [searchTerm, user]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.getClients(searchTerm);
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDsps = async () => {
    try {
      let dsps = [];
      
      if (user?.role === 'manager') {
        // For Managers, try to fetch assigned DSPs first
        try {
          console.log('Fetching manager assigned DSPs...');
          dsps = await api.getMyAssignedDsps();
          console.log(`Manager has ${dsps.length} assigned DSPs`);
          
          // If no assigned DSPs, try fetching all organization DSPs
          if (!dsps || dsps.length === 0) {
            console.log('No assigned DSPs found, trying to fetch all organization DSPs...');
            try {
              dsps = await api.getOrganizationUsers('dsp');
              console.log(`Fetched ${dsps.length} organization DSPs as fallback`);
            } catch (fallbackError: any) {
              console.error('Manager cannot access organization DSPs:', fallbackError.message);
              // It's okay - manager just has no DSPs to show
              dsps = [];
            }
          }
        } catch (error: any) {
          console.error('Error fetching DSPs for manager:', error.message);
          dsps = [];
        }
      } else if (user?.role === 'admin') {
        // For Admins, fetch all DSPs
        try {
          console.log('Admin fetching all organization DSPs...');
          dsps = await api.getOrganizationUsers('dsp');
          console.log(`Admin has ${dsps.length} DSPs available`);
        } catch (error: any) {
          console.error('Admin error fetching DSPs:', error.message);
          dsps = [];
        }
      }
      
      console.log(`Final: ${dsps.length} available DSPs for ${user?.role}`);
      setAvailableDsps(dsps || []);
    } catch (error) {
      console.error('Error loading DSPs:', error);
      setAvailableDsps([]);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const client = await api.createClient({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dddId: formData.dddId || undefined,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        isActive: formData.isActive
      });

      // If DSP selected, create assignment
      if (formData.dspId) {
        await api.request('/api/assignments', {
          method: 'POST',
          body: JSON.stringify({
            clientId: client.id,
            dspId: formData.dspId
          })
        });
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dddId: '',
        dateOfBirth: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        isActive: true,
        dspId: ''
      });
      
      setShowAddModal(false);
      loadClients();
      alert('Client created successfully!');
    } catch (error: any) {
      console.error('Error creating client:', error);
      alert(error.message || 'Failed to create client. Please try again.');
    }
  };

  const handleViewClient = async (clientId: string) => {
    try {
      const client = await api.getClient(clientId);
      setSelectedClient(client);
      setShowModal(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage client information and records</p>
          </div>
          {isManager && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients by name or DDD ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => !c.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No clients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DDD ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {client.firstName[0]}{client.lastName[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </div>
                          {client.address && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {client.address.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.dddId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(client.dateOfBirth)}
                      </div>
                      {client.dateOfBirth && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(client.dateOfBirth).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.emergencyContactName && (
                        <div className="text-sm">
                          <div className="text-gray-900">{client.emergencyContactName}</div>
                          {client.emergencyContactPhone && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {client.emergencyContactPhone}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewClient(client.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {isManager && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setShowEditModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setClientToDelete(client);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Client Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedClient.dddId || 'No DDD ID'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="text-gray-900 font-medium">
                      {selectedClient.dateOfBirth 
                        ? new Date(selectedClient.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="text-gray-900 font-medium">
                      {calculateAge(selectedClient.dateOfBirth)} years
                    </p>
                  </div>
                </div>

                {selectedClient.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900 font-medium">{selectedClient.address}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="text-gray-900 font-medium">
                      {selectedClient.emergencyContactName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emergency Phone</p>
                    <p className="text-gray-900 font-medium">
                      {selectedClient.emergencyContactPhone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedClient.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedClient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
                {isManager && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit Client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
             onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DDD ID</label>
                  <input 
                    type="text" 
                    value={formData.dddId}
                    onChange={(e) => setFormData({...formData, dddId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <SpeechToTextInput
                    value={formData.address}
                    onChange={(val) => setFormData({...formData, address: val})}
                    multiline
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input 
                      type="text" 
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input 
                      type="tel" 
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
                
                {/* DSP Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to DSP (Optional)
                  </label>
                  <select
                    value={formData.dspId}
                    onChange={(e) => setFormData({...formData, dspId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- No DSP (assign later) --</option>
                    {availableDsps.map(dsp => (
                      <option key={dsp.id} value={dsp.id}>
                        {dsp.firstName} {dsp.lastName}
                      </option>
                    ))}
                  </select>
                  {availableDsps.length === 0 ? (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      ⚠️ No DSPs available. Please create DSP users first or assign DSPs to your account (Manager).
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      {availableDsps.length} DSP{availableDsps.length !== 1 ? 's' : ''} available
                      {user?.role === 'manager' && ' (your assigned DSPs)'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2 rounded" 
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    dddId: '',
                    dateOfBirth: '',
                    address: '',
                    emergencyContactName: '',
                    emergencyContactPhone: '',
                    isActive: true,
                    dspId: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateClient}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
             onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Edit Client</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input type="text" defaultValue={selectedClient.firstName} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input type="text" defaultValue={selectedClient.lastName} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DDD ID</label>
                  <input type="text" defaultValue={selectedClient.dddId} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input type="date" defaultValue={selectedClient.dateOfBirth?.split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea rows={2} defaultValue={selectedClient.address} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Use microphone button for voice input"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input type="text" defaultValue={selectedClient.emergencyContactName} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input type="tel" defaultValue={selectedClient.emergencyContactPhone} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked={selectedClient.isActive} className="mr-2 rounded" />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { alert('Client updated! (Would save to API)'); setShowEditModal(false); loadClients(); }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
             onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Delete Client</h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-semibold">{clientToDelete.firstName} {clientToDelete.lastName}</span>?
              </p>
              <p className="text-sm text-gray-600 mb-2">This action will:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                <li>Remove all client records</li>
                <li>Delete associated service history</li>
                <li>Cannot be undone</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                   Consider marking the client as inactive instead of deleting.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { alert('Client deleted! (Would delete via API)'); setShowDeleteModal(false); setClientToDelete(null); loadClients(); }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
