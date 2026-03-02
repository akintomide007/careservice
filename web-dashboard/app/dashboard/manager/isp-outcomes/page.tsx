'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, Users, TrendingUp, Award, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import SpeechToTextInput from '@/components/SpeechToTextInput';

interface IspOutcome {
  id: string;
  outcomeDescription: string;
  category?: string;
  targetDate?: string;
  status: string;
  overallProgress: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  reviewFrequency?: string;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  goals: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  _count?: {
    goals: number;
  };
}

export default function IspOutcomesPage() {
  const [outcomes, setOutcomes] = useState<IspOutcome[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<IspOutcome | null>(null);

  const [outcomeForm, setOutcomeForm] = useState({
    clientId: '',
    outcomeDescription: '',
    category: 'Communication',
    targetDate: '',
    reviewFrequency: 'quarterly',
    nextReviewDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData] = await Promise.all([
        api.getClients()
      ]);
      
      setClients(clientsData);

      // Load outcomes - we'll need to create this endpoint or use existing client data
      // For now, let's fetch from clients and expand their outcomes
      const allOutcomes: IspOutcome[] = [];
      for (const client of clientsData) {
        try {
          const clientDetail = await api.getClient(client.id);
          if (clientDetail.ispOutcomes) {
            allOutcomes.push(...clientDetail.ispOutcomes.map((o: any) => ({
              ...o,
              client
            })));
          }
        } catch (err) {
          console.error('Error loading outcomes for client:', client.id);
        }
      }
      setOutcomes(allOutcomes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/api/isp-outcomes/outcomes', {
        method: 'POST',
        body: JSON.stringify(outcomeForm),
      });
      
      setShowCreateModal(false);
      resetForm();
      loadData();
      alert('ISP Outcome created successfully!');
    } catch (error) {
      console.error('Error creating outcome:', error);
      alert('Failed to create outcome. Please try again.');
    }
  };

  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) return;

    try {
      await api.request(`/api/isp-outcomes/outcomes/${selectedOutcome.id}`, {
        method: 'PUT',
        body: JSON.stringify(outcomeForm),
      });
      
      setShowEditModal(false);
      setSelectedOutcome(null);
      resetForm();
      loadData();
      alert('ISP Outcome updated successfully!');
    } catch (error) {
      console.error('Error updating outcome:', error);
      alert('Failed to update outcome. Please try again.');
    }
  };

  const handleDeleteOutcome = async (outcomeId: string) => {
    if (!confirm('Are you sure you want to delete this ISP outcome? This will also delete all associated goals.')) return;

    try {
      await api.request(`/api/isp-outcomes/outcomes/${outcomeId}`, {
        method: 'DELETE',
      });
      
      loadData();
      alert('ISP Outcome deleted successfully!');
    } catch (error) {
      console.error('Error deleting outcome:', error);
      alert('Failed to delete outcome.');
    }
  };

  const resetForm = () => {
    setOutcomeForm({
      clientId: '',
      outcomeDescription: '',
      category: 'Communication',
      targetDate: '',
      reviewFrequency: 'quarterly',
      nextReviewDate: ''
    });
  };

  const openEditModal = (outcome: IspOutcome) => {
    setSelectedOutcome(outcome);
    setOutcomeForm({
      clientId: outcome.client.id,
      outcomeDescription: outcome.outcomeDescription,
      category: outcome.category || 'Communication',
      targetDate: outcome.targetDate ? new Date(outcome.targetDate).toISOString().split('T')[0] : '',
      reviewFrequency: outcome.reviewFrequency || 'quarterly',
      nextReviewDate: outcome.nextReviewDate ? new Date(outcome.nextReviewDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const categories = ['Communication', 'Daily Living', 'Social Skills', 'Vocational', 'Health & Wellness', 'Community'];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      'Communication': '💬',
      'Daily Living': '🏠',
      'Social Skills': '👥',
      'Vocational': '💼',
      'Health & Wellness': '❤️',
      'Community': '🌍'
    };
    return icons[category || ''] || '🎯';
  };

  const totalOutcomes = outcomes.length;
  const activeOutcomes = outcomes.filter(o => o.status === 'active').length;
  const avgProgress = outcomes.length > 0
    ? Math.round(outcomes.reduce((sum, o) => sum + o.overallProgress, 0) / outcomes.length)
    : 0;
  const totalGoals = outcomes.reduce((sum, o) => sum + (o._count?.goals || o.goals?.length || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ISP Outcomes</h1>
            <p className="text-gray-600 mt-1">Manage Individual Service Plan outcomes for clients</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Outcome</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">About ISP Outcomes</h3>
            <p className="text-sm text-blue-700 mt-1">
              ISP Outcomes are broad statements about what a client wants to achieve. Each outcome can have multiple specific goals with milestones and activities. 
              <strong> Create outcomes here first, then create goals linked to these outcomes.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Outcomes</p>
              <p className="text-2xl font-bold text-gray-900">{totalOutcomes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Outcomes</p>
              <p className="text-2xl font-bold text-gray-900">{activeOutcomes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Outcomes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Client ISP Outcomes ({outcomes.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading outcomes...</p>
          </div>
        ) : outcomes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg mb-2">No ISP outcomes yet</p>
            <p className="text-sm mb-4">Create your first ISP outcome to start tracking client progress</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create First Outcome
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {outcomes.map((outcome) => {
              const goalsCount = outcome._count?.goals || outcome.goals?.length || 0;
              const clientName = `${outcome.client.firstName} ${outcome.client.lastName}`;

              return (
                <div key={outcome.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getCategoryIcon(outcome.category)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{outcome.outcomeDescription}</h3>
                          <p className="text-sm text-gray-600">Client: {clientName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {outcome.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {outcome.category}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          outcome.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {outcome.status}
                        </span>
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {goalsCount} goal{goalsCount !== 1 ? 's' : ''}
                        </span>
                        {outcome.targetDate && (
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Target: {new Date(outcome.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-semibold text-gray-900">{outcome.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${getProgressColor(outcome.overallProgress)}`}
                            style={{ width: `${outcome.overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(outcome)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit outcome"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOutcome(outcome.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete outcome"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedOutcome(null);
            resetForm();
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {showEditModal ? 'Edit ISP Outcome' : 'Create ISP Outcome'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedOutcome(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
              <form onSubmit={showEditModal ? handleUpdateOutcome : handleCreateOutcome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select
                    required
                    value={outcomeForm.clientId}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={showEditModal}
                  >
                    <option value="">Select client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                  {showEditModal && (
                    <p className="text-xs text-gray-500 mt-1">Client cannot be changed after creation</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome Description *</label>
                  <SpeechToTextInput
                    value={outcomeForm.outcomeDescription}
                    onChange={(val) => setOutcomeForm({ ...outcomeForm, outcomeDescription: val })}
                    placeholder="E.g., Improve independence in daily living activities"
                    multiline
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe the broad outcome the client wants to achieve
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={outcomeForm.category}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Frequency</label>
                    <select
                      value={outcomeForm.reviewFrequency}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, reviewFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="biannually">Bi-annually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={outcomeForm.targetDate}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                    <input
                      type="date"
                      value={outcomeForm.nextReviewDate}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, nextReviewDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedOutcome(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showEditModal ? 'Update Outcome' : 'Create Outcome'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
