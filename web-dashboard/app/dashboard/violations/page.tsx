'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ViolationsPage() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string; severity?: string }>({});
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    loadViolations();
    if (!isManager) {
      loadSummary();
    }
  }, [filter]);

  const loadViolations = async () => {
    try {
      setLoading(true);
      const data = isManager 
        ? await api.getViolations(filter)
        : await api.getMyViolations(filter.status);
      setViolations(data);
    } catch (error) {
      console.error('Error loading violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      if (user?.id) {
        const data = await api.getUserViolationSummary(user.id);
        setSummary(data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleAppeal = async (violationId: string) => {
    const appealNotes = prompt('Please provide your appeal reason:');
    if (!appealNotes) return;

    try {
      await api.appealViolation(violationId, appealNotes);
      alert('Appeal submitted successfully');
      loadViolations();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleResolve = async (violationId: string) => {
    const resolution = prompt('Resolution notes:');
    if (!resolution) return;

    try {
      await api.resolveViolation(violationId, resolution);
      alert('Violation resolved');
      loadViolations();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'minor': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'under_appeal': return 'bg-blue-100 text-blue-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isManager ? 'Violations Management' : 'My Violations'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isManager ? 'Review and manage team violations' : 'View your violation history'}
        </p>
      </div>

      {/* User Summary (DSP only) */}
      {!isManager && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Violations</div>
            <div className="text-2xl font-bold">{summary.totalViolations || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Open</div>
            <div className="text-2xl font-bold text-red-600">{summary.openViolations || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{summary.resolvedViolations || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Points</div>
            <div className="text-2xl font-bold text-orange-600">{summary.totalPoints || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="under_appeal">Under Appeal</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={filter.severity || ''}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value || undefined })}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="moderate">Moderate</option>
            <option value="minor">Minor</option>
          </select>

          <button
            onClick={() => setFilter({})}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Violations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading violations...</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No violations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {violations.map((violation) => (
              <div key={violation.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getSeverityColor(violation.severity)}`}>
                        {violation.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                        {violation.status.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {violation.points} points
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">
                      {violation.violationType.replace('_', ' ').toUpperCase()}
                    </h3>

                    <p className="text-gray-700 mb-3">{violation.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span> {new Date(violation.incidentDate).toLocaleDateString()}</span>
                      {violation.violator && (
                        <span> {violation.violator.firstName} {violation.violator.lastName}</span>
                      )}
                      {violation.reporter && (
                        <span> Reported by: {violation.reporter.firstName} {violation.reporter.lastName}</span>
                      )}
                    </div>

                    {violation.correctiveAction && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">Corrective Action:</p>
                        <p className="text-sm text-blue-700">{violation.correctiveAction}</p>
                      </div>
                    )}

                    {violation.resolution && (
                      <div className="mt-3 p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium text-green-900">Resolution:</p>
                        <p className="text-sm text-green-700">{violation.resolution}</p>
                        {violation.resolver && (
                          <p className="text-xs text-green-600 mt-1">
                            Resolved by {violation.resolver.firstName} {violation.resolver.lastName}
                          </p>
                        )}
                      </div>
                    )}

                    {violation.isAppealed && violation.appealNotes && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded">
                        <p className="text-sm font-medium text-yellow-900">Appeal Notes:</p>
                        <p className="text-sm text-yellow-700">{violation.appealNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!isManager && violation.status === 'open' && !violation.isAppealed && (
                      <button
                        onClick={() => handleAppeal(violation.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                      >
                        Appeal
                      </button>
                    )}
                    {isManager && violation.status === 'open' && (
                      <button
                        onClick={() => handleResolve(violation.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
