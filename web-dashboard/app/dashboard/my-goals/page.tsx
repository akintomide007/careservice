'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, Clock, Activity, Award, Calendar, Plus, Users } from 'lucide-react';
import { api } from '@/lib/api';
import SpeechToTextInput from '@/components/SpeechToTextInput';

interface IspGoal {
  id: string;
  title: string;
  description?: string;
  goalType: string;
  priority: string;
  status: string;
  progressPercentage: number;
  targetDate?: string;
  frequency?: string;
  createdAt: string;
  outcome: {
    id: string;
    outcomeDescription: string;
    category?: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  milestones: Array<{
    id: string;
    title: string;
    status: string;
    targetDate: string;
    achievedDate?: string;
  }>;
  _count: {
    activities: number;
    milestones: number;
  };
}

export default function DspMyGoalsPage() {
  const [goals, setGoals] = useState<IspGoal[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState<IspGoal | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [activityForm, setActivityForm] = useState({
    activityDate: new Date().toISOString().split('T')[0],
    activityType: 'practice',
    description: '',
    duration: 30,
    successLevel: 'moderate_assist',
    observations: '',
    progressRating: 3
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by assigned clients for DSPs
      const [goalsData, clientsData] = await Promise.all([
        api.request('/api/isp-goals/goals'),
        api.getClients()
      ]);
      
      setGoals(goalsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await api.request(`/api/isp-goals/goals/${selectedGoal.id}/activities`, {
        method: 'POST',
        body: JSON.stringify(activityForm),
      });
      
      setShowActivityModal(false);
      setActivityForm({
        activityDate: new Date().toISOString().split('T')[0],
        activityType: 'practice',
        description: '',
        duration: 30,
        successLevel: 'moderate_assist',
        observations: '',
        progressRating: 3
      });
      loadData();
      alert('Activity logged successfully!');
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('Failed to log activity. Please try again.');
    }
  };

  const filteredGoals = selectedClient === 'all'
    ? goals
    : goals.filter(g => g.outcome.client.id === selectedClient);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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

  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length)
    : 0;
  const totalMilestones = goals.reduce((sum, g) => sum + g._count.milestones, 0);
  const completedMilestones = goals.reduce((sum, g) => 
    sum + g.milestones.filter(m => m.status === 'achieved').length, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Client ISP Goals</h1>
        <p className="text-gray-600 mt-1">View and track ISP goals for your assigned clients</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">About ISP Goals</h3>
            <p className="text-sm text-blue-700 mt-1">
              These are Individual Service Plan goals for your assigned clients. Log activities to track progress 
              and help clients achieve their outcomes. Your activities contribute to overall client progress reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-600">Milestones</p>
              <p className="text-2xl font-bold text-gray-900">{completedMilestones}/{totalMilestones}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Client Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <Users className="w-5 h-5 text-gray-600" />
          <label className="font-medium text-gray-700">Filter by Client:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients ({clients.length})</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Client Goals ({filteredGoals.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading goals...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg mb-2">No ISP goals assigned yet</p>
            <p className="text-sm">Your manager will create goals for your assigned clients</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGoals.map((goal) => {
              const completedMilestones = goal.milestones.filter(m => m.status === 'achieved').length;
              const clientName = `${goal.outcome.client.firstName} ${goal.outcome.client.lastName}`;

              return (
                <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(goal.outcome.category)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                          {goal.priority} priority
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Client: {clientName}
                        </span>
                        {goal.targetDate && (
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {completedMilestones}/{goal._count.milestones} milestones
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {goal._count.activities} activities logged
                        </span>
                      </div>

                      {/* Outcome Context */}
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Client Outcome:</p>
                        <p className="text-sm text-blue-700">{goal.outcome.outcomeDescription}</p>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{goal.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${getProgressColor(goal.progressPercentage)}`}
                            style={{ width: `${goal.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button 
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowActivityModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Log Activity
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showActivityModal && selectedGoal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowActivityModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Log Activity</h2>
                  <p className="text-sm text-gray-600">{selectedGoal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
              <form onSubmit={handleLogActivity} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Date *</label>
                    <input
                      type="date"
                      required
                      value={activityForm.activityDate}
                      onChange={(e) => setActivityForm({ ...activityForm, activityDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                    <input
                      type="number"
                      required
                      value={activityForm.duration}
                      onChange={(e) => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
                  <select 
                    required
                    value={activityForm.activityType}
                    onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="practice">Practice Session</option>
                    <option value="assessment">Progress Assessment</option>
                    <option value="training">Training Activity</option>
                    <option value="review">Goal Review</option>
                    <option value="demonstration">Skill Demonstration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Success Level *</label>
                  <select 
                    required
                    value={activityForm.successLevel}
                    onChange={(e) => setActivityForm({ ...activityForm, successLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="independent">Independent</option>
                    <option value="minimal_assist">Minimal Assistance</option>
                    <option value="moderate_assist">Moderate Assistance</option>
                    <option value="maximum_assist">Maximum Assistance</option>
                    <option value="not_attempted">Not Attempted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress Rating (1-5) *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setActivityForm({ ...activityForm, progressRating: rating })}
                        className={`flex-1 px-3 py-2 border-2 rounded-lg transition-colors ${
                          activityForm.progressRating === rating
                            ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">1 = Needs Improvement, 5 = Excellent</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Description *</label>
                  <SpeechToTextInput
                    value={activityForm.description}
                    onChange={(val) => setActivityForm({ ...activityForm, description: val })}
                    placeholder="Describe what was accomplished during this activity..."
                    multiline
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations & Notes</label>
                  <SpeechToTextInput
                    value={activityForm.observations}
                    onChange={(val) => setActivityForm({ ...activityForm, observations: val })}
                    placeholder="Any additional observations or notes..."
                    multiline
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowActivityModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Log Activity
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
