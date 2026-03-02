'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, Clock, Activity, Award, Calendar, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SpeechToTextInput from '@/components/SpeechToTextInput';

interface Goal {
  id: string;
  title: string;
  client: string;
  category: string;
  priority: string;
  progress: number;
  targetDate: string;
  status: string;
  milestones: number;
  completedMilestones: number;
}

export default function ISPGoalsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);

  // Dummy data similar to reports structure
  const dummyGoals: Goal[] = [
    {
      id: '1',
      title: 'Improve Communication Skills',
      client: 'John Doe',
      category: 'Communication',
      priority: 'high',
      progress: 75,
      targetDate: '2026-06-30',
      status: 'active',
      milestones: 5,
      completedMilestones: 4
    },
    {
      id: '2',
      title: 'Develop Independent Living Skills',
      client: 'Jane Smith',
      category: 'Daily Living',
      priority: 'high',
      progress: 60,
      targetDate: '2026-08-15',
      status: 'active',
      milestones: 8,
      completedMilestones: 5
    },
    {
      id: '3',
      title: 'Enhance Social Interaction',
      client: 'John Doe',
      category: 'Social Skills',
      priority: 'medium',
      progress: 40,
      targetDate: '2026-09-30',
      status: 'active',
      milestones: 6,
      completedMilestones: 2
    },
    {
      id: '4',
      title: 'Vocational Training Completion',
      client: 'Mike Johnson',
      category: 'Vocational',
      priority: 'high',
      progress: 90,
      targetDate: '2026-04-30',
      status: 'active',
      milestones: 4,
      completedMilestones: 4
    },
    {
      id: '5',
      title: 'Health and Wellness Routine',
      client: 'Jane Smith',
      category: 'Health & Wellness',
      priority: 'medium',
      progress: 55,
      targetDate: '2026-12-31',
      status: 'active',
      milestones: 10,
      completedMilestones: 5
    },
    {
      id: '6',
      title: 'Community Integration',
      client: 'Mike Johnson',
      category: 'Community',
      priority: 'low',
      progress: 25,
      targetDate: '2026-10-31',
      status: 'active',
      milestones: 7,
      completedMilestones: 2
    }
  ];

  const [goals] = useState<Goal[]>(dummyGoals);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const categories = ['all', 'Communication', 'Daily Living', 'Social Skills', 'Vocational', 'Health & Wellness', 'Community'];

  const filteredGoals = selectedCategory === 'all'
    ? goals
    : goals.filter(g => g.category === selectedCategory);

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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Communication': '',
      'Daily Living': '',
      'Social Skills': '',
      'Vocational': '',
      'Health & Wellness': '',
      'Community': ''
    };
    return icons[category] || '';
  };

  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const avgProgress = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length);
  const completedMilestones = goals.reduce((sum, g) => sum + g.completedMilestones, 0);
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones, 0);

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
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGoals.map((goal) => (
              <div key={goal.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                        {goal.priority} priority
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        Client: {goal.client}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        {goal.completedMilestones}/{goal.milestones} milestones
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                          style={{ width: `${goal.progress}%` }}
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
                    View Milestones
                  </button>
                </div>
              </div>
            ))}
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
                <li>Review dates ensure regular progress monitoring</li>
                <li>Reports can be generated for compliance documentation</li>
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
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter goal title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select client...</option>
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select category...</option>
                      <option value="Communication"> Communication</option>
                      <option value="Daily Living"> Daily Living</option>
                      <option value="Social Skills"> Social Skills</option>
                      <option value="Vocational"> Vocational</option>
                      <option value="Health & Wellness"> Health & Wellness</option>
                      <option value="Community"> Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Date *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <SpeechToTextInput
                    value=""
                    onChange={(val) => {}}
                    placeholder="Describe the goal and expected outcomes..."
                    multiline
                    rows={4}
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50">
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Goal created successfully! (This would save to API)');
                  setShowNewGoalModal(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Goal
              </button>
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
                <span className="text-3xl">{getCategoryIcon(selectedGoal.category)}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
                  <p className="text-sm text-gray-600">{selectedGoal.client}</p>
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
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-semibold">{selectedGoal.category}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedGoal.priority)}`}>
                    {selectedGoal.priority}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Target Date</p>
                  <p className="font-semibold">{new Date(selectedGoal.targetDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedGoal.progress}%</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Progress Overview</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-semibold">{selectedGoal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(selectedGoal.progress)}`}
                      style={{ width: `${selectedGoal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedGoal.completedMilestones} of {selectedGoal.milestones} milestones completed
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Recent Activities</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Communication practice session</span>
                    </div>
                    <span className="text-xs text-gray-600">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Milestone 4 completed</span>
                    </div>
                    <span className="text-xs text-gray-600">5 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Weekly progress review</span>
                    </div>
                    <span className="text-xs text-gray-600">1 week ago</span>
                  </div>
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Goal
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
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Date *</label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="">Select type...</option>
                    <option value="practice">Practice Session</option>
                    <option value="assessment">Progress Assessment</option>
                    <option value="training">Training Activity</option>
                    <option value="review">Goal Review</option>
                    <option value="milestone">Milestone Completion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Success Level *</label>
                  <div className="flex gap-2">
                    {['Excellent', 'Good', 'Fair', 'Needs Improvement'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-sm"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Description *</label>
                  <SpeechToTextInput
                    value=""
                    onChange={(val) => {}}
                    placeholder="Describe what was accomplished during this activity..."
                    multiline
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations & Notes</label>
                  <SpeechToTextInput
                    value=""
                    onChange={(val) => {}}
                    placeholder="Any additional observations or notes..."
                    multiline
                    rows={3}
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Activity logged successfully! (This would save to API)');
                  setShowActivityModal(false);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Log Activity
              </button>
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
                  <span className="text-sm font-semibold">{selectedGoal.completedMilestones}/{selectedGoal.milestones} Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-600"
                    style={{ width: `${(selectedGoal.completedMilestones / selectedGoal.milestones) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: selectedGoal.milestones }, (_, i) => {
                  const isCompleted = i < selectedGoal.completedMilestones;
                  return (
                    <div key={i} className={`p-4 rounded-lg border-2 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
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
                            Milestone {i + 1}: {isCompleted ? 'Completed' : 'In Progress'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {i === 0 && 'Initial assessment and baseline establishment'}
                            {i === 1 && 'Introduction to basic concepts and techniques'}
                            {i === 2 && 'Practice and skill development phase'}
                            {i === 3 && 'Advanced application and refinement'}
                            {i === 4 && 'Independent demonstration of skills'}
                            {i > 4 && 'Additional milestone objective description'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {isCompleted ? 'Completed' : 'Target'}: {new Date(Date.now() + (i - selectedGoal.completedMilestones) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </span>
                            {isCompleted && (
                              <span className="text-green-600 font-medium"> Achieved</span>
                            )}
                          </div>
                        </div>
                        {!isCompleted && (
                          <button
                            onClick={() => alert('Mark milestone as complete (This would update via API)')}
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
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => alert('Add new milestone (This would open a form)')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
