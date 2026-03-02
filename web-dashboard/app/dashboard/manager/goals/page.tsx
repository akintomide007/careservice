'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, Clock, Activity, Award, Calendar, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function ISPGoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<IspGoal[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<IspGoal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);

  const [goalForm, setGoalForm] = useState({
    outcomeId: '',
    title: '',
    description: '',
    goalType: 'behavioral',
    priority: 'medium',
    targetDate: '',
    frequency: 'weekly',
    milestones: [] as Array<{
      title: string;
      description: string;
      targetDate: string;
      completionCriteria: string;
    }>
  });

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
      const [goalsData, clientsData] = await Promise.all([
        api.getIspGoals(),
        api.getClients()
      ]);
      
      setGoals(goalsData);
      setClients(clientsData);

      // Load all outcomes from all clients
      const allOutcomes: any[] = [];
      for (const client of clientsData) {
        try {
          const clientDetail = await api.getClient(client.id);
          if (clientDetail.ispOutcomes) {
            allOutcomes.push(...clientDetail.ispOutcomes.map((o: any) => ({
              ...o,
              client: {
                id: client.id,
                firstName: client.firstName,
                lastName: client.lastName
              }
            })));
          }
        } catch (err) {
          console.error('Error loading outcomes for client:', client.id);
        }
      }
      setOutcomes(allOutcomes);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Communication', 'Daily Living', 'Social Skills', 'Vocational', 'Health & Wellness', 'Community'];

  const filteredGoals = selectedCategory === 'all'
    ? goals
    : goals.filter(g => g.outcome.category === selectedCategory);

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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIspGoal(goalForm);
      
      setShowNewGoalModal(false);
      setGoalForm({
        outcomeId: '',
        title: '',
        description: '',
        goalType: 'behavioral',
        priority: 'medium',
        targetDate: '',
        frequency: 'weekly',
        milestones: []
      });
      loadData();
      alert('Goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await api.addGoalActivity(selectedGoal.id, activityForm);
      
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

  const handleUpdateMilestone = async (milestoneId: string, status: string) => {
    try {
      await api.updateMilestone(milestoneId, { 
        status,
        achievedDate: status === 'achieved' ? new Date().toISOString() : null
      });
      
      loadData();
      alert('Milestone updated successfully!');
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone.');
    }
  };

  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length)
    : 0;
  const completedMilestones = goals.reduce((sum, g) => 
    sum + g.milestones.filter(m => m.status === 'achieved').length, 0);
  const totalMilestones = goals.reduce((sum, g) => sum + g._count.milestones, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ISP Goals & Outcomes</h1>
            <p className="text-gray-600 mt-1">Individual Service Plan goal tracking and progress monitoring</p>
          </div>
          <button 
            onClick={() => setShowNewGoalModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Goal</span>
          </button>
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

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : `${getCategoryIcon(category)} ${category}`}
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'All Goals' : `${selectedCategory} Goals`} ({filteredGoals.length})
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
            <p>No goals found in this category</p>
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first goal
            </button>
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
                          <Activity className="w-4 h-4 mr-1" />
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
                          {goal._count.activities} activities
                        </span>
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
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowActivityModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                    >
                      Add Activity
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowMilestonesModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                    >
                      Milestones ({completedMilestones}/{goal._count.milestones})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">ISP Goal Tracking Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Goals are linked to specific clients and ISP outcomes</li>
                <li>Track progress through milestones and activities</li>
                <li>Activities can be logged during progress note creation</li>
                <li>Progress automatically updates based on milestone completion</li>
                <li>Use the DSP Progress Dashboard to monitor team performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewGoalModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Create New Goal</h2>
              </div>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Link Goal to ISP Outcome</p>
                    <p>Goals must be linked to an ISP Outcome. {outcomes.length === 0 ? (
                      <>
                        <strong>No outcomes found!</strong> Create ISP outcomes first from the{' '}
                        <a href="/dashboard/manager/isp-outcomes" className="underline font-medium hover:text-blue-900">
                          ISP Outcomes page
                        </a>.
                      </>
                    ) : (
                      `Select from ${outcomes.length} available outcome${outcomes.length !== 1 ? 's' : ''} below.`
                    )}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client & Outcome *</label>
                  <select 
                    required
                    value={goalForm.outcomeId}
                    onChange={(e) => setGoalForm({ ...goalForm, outcomeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={outcomes.length === 0}
                  >
                    <option value="">
                      {outcomes.length === 0 ? 'No outcomes available - create outcomes first' : 'Select client outcome...'}
                    </option>
                    {outcomes.map(outcome => (
                      <option key={outcome.id} value={outcome.id}>
                        {outcome.client.firstName} {outcome.client.lastName} - {outcome.outcomeDescription.substring(0, 60)}
                        {outcome.outcomeDescription.length > 60 ? '...' : ''}
                      </option>
                    ))}
                  </select>
                  {outcomes.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Create ISP outcomes first to enable goal creation
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    value={goalForm.title}
                    onChange={(e) => {
                      e.stopPropagation();
                      setGoalForm({ ...goalForm, title: e.target.value });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter goal title..."
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type *</label>
                    <select 
                      value={goalForm.goalType}
                      onChange={(e) => setGoalForm({ ...goalForm, goalType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="skill_development">Skill Development</option>
                      <option value="health">Health</option>
                      <option value="social">Social</option>
                      <option value="vocational">Vocational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                    <select 
                      value={goalForm.priority}
                      onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={goalForm.targetDate}
                      onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Frequency</label>
                    <select 
                      value={goalForm.frequency}
                      onChange={(e) => setGoalForm({ ...goalForm, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <SpeechToTextInput
                    value={goalForm.description}
                    onChange={(val) => setGoalForm({ ...goalForm, description: val })}
                    placeholder="Describe the goal and expected outcomes..."
                    multiline
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewGoalModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Goal Details Modal */}
      {showDetailsModal && selectedGoal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getCategoryIcon(selectedGoal.outcome.category)}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedGoal.outcome.client.firstName} {selectedGoal.outcome.client.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Goal Type</p>
                  <p className="font-semibold capitalize">{selectedGoal.goalType.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedGoal.priority)}`}>
                    {selectedGoal.priority}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Target Date</p>
                  <p className="font-semibold">
                    {selectedGoal.targetDate 
                      ? new Date(selectedGoal.targetDate).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedGoal.progressPercentage}%</p>
                </div>
              </div>
              
              {selectedGoal.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700">{selectedGoal.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-3">Progress Overview</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-semibold">{selectedGoal.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(selectedGoal.progressPercentage)}`}
                      style={{ width: `${selectedGoal.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                    <span>{selectedGoal.milestones.filter(m => m.status === 'achieved').length} of {selectedGoal._count.milestones} milestones completed</span>
                    <span>{selectedGoal._count.activities} activities logged</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Outcome</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700">{selectedGoal.outcome.outcomeDescription}</p>
                  {selectedGoal.outcome.category && (
                    <p className="text-sm text-gray-600 mt-2">Category: {selectedGoal.outcome.category}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowActivityModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Activity
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowMilestonesModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Milestones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
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

      {/* Milestones Modal */}
      {showMilestonesModal && selectedGoal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMilestonesModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
                  <p className="text-sm text-gray-600">{selectedGoal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-semibold">
                    {selectedGoal.milestones.filter(m => m.status === 'achieved').length}/{selectedGoal._count.milestones} Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-600"
                    style={{ width: `${(selectedGoal.milestones.filter(m => m.status === 'achieved').length / selectedGoal._count.milestones) * 100}%` }}
                  ></div>
                </div>
              </div>

              {selectedGoal.milestones.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No milestones defined for this goal yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedGoal.milestones.map((milestone, index) => {
                    const isCompleted = milestone.status === 'achieved';
                    return (
                      <div key={milestone.id} className={`p-4 rounded-lg border-2 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-1 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {milestone.title}
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Target: {new Date(milestone.targetDate).toLocaleDateString()}
                              </span>
                              {isCompleted && milestone.achievedDate && (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                                </span>
                              )}
                              <span className="capitalize">{milestone.status}</span>
                            </div>
                          </div>
                          {!isCompleted && (
                            <button
                              onClick={() => handleUpdateMilestone(milestone.id, 'achieved')}
                              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end bg-gray-50">
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
