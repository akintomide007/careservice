'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileText, CheckCircle, Clock, XCircle, Filter, Download, Eye } from 'lucide-react';

export default function RecordsManagementPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordType, setRecordType] = useState<'progress_notes' | 'incidents' | 'forms'>('progress_notes');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRecords();
  }, [recordType, statusFilter]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (recordType === 'progress_notes') {
        data = await api.getProgressNotes(statusFilter !== 'all' ? { status: statusFilter } : {});
      } else if (recordType === 'incidents') {
        data = await api.getIncidents(statusFilter !== 'all' ? { status: statusFilter } : {});
      } else if (recordType === 'forms') {
        data = await api.getSubmittedFormResponses();
      }
      
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
      case 'open':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: records.length,
    pending: records.filter(r => ['pending', 'submitted', 'draft'].includes(r.status?.toLowerCase())).length,
    approved: records.filter(r => ['approved', 'completed', 'resolved'].includes(r.status?.toLowerCase())).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Records Management</h1>
        <p className="text-gray-600 mt-1">Centralized access to all documentation and records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setRecordType('progress_notes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  recordType === 'progress_notes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Progress Notes
              </button>
              <button
                onClick={() => setRecordType('incidents')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  recordType === 'incidents'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Incident Reports
              </button>
              <button
                onClick={() => setRecordType('forms')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  recordType === 'forms'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Form Responses
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              <button
                onClick={() => alert('Export functionality coming soon')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No records found</p>
            <p className="text-gray-400 text-sm mt-2">Records will appear here as they are created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {recordType === 'progress_notes' ? 'Client' : recordType === 'incidents' ? 'Client' : 'Form Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff/User
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
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.createdAt || record.serviceDate || record.incidentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.client ? `${record.client.firstName} ${record.client.lastName}` : 
                       record.template ? record.template.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.staff ? `${record.staff.firstName} ${record.staff.lastName}` :
                       record.user ? `${record.user.firstName} ${record.user.lastName}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => alert(`View ${recordType} details: ${record.id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Records Management</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Centralized hub for all documentation. Filter by type and status to review, approve, or export records as needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
