'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Award, Target, Clock, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

interface DspProgress {
  dsp: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  stats: {
    assignedClients: number;
    activeGoals: number;
    activitiesLogged: number;
    avgProgressRating: number;
    completedMilestones: number;
    totalMilestones: number;
  };
  recentActivities: Array<{
    id: string;
    activityDate: string;
    activityType: string;
    successLevel: string;
    progressRating: number;
    goal: {
      title: string;
      outcome: {
        client: {
          firstName: string;
          lastName: string;
        };
      };
    };
  }>;
}

export default function DspProgressDashboardPage() {
  const [dsps, setDsps] = useState<any[]>([]);
  const [selectedDsp, setSelectedDsp] = useState<string>('all');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDsp, setExpandedDsp] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load DSPs and goals
      const [dspsData, goals] = await Promise.all([
        api.getOrganizationUsers('dsp'),
        api.request('/api/isp-goals/goals')
      ]);

      setDsps(dspsData);

      // Load all ISP activities for the time range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      const allActivities: any[] = [];
      for (const goal of goals) {
        try {
          const goalActivities = await api.getGoalActivities(goal.id);
          allActivities.push(...goalActivities.map((a: any) => ({ ...a, goal })));
        } catch (err) {
          // Skip if error loading activities for a goal
        }
      }
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading DSP progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDspStats = (dspId: string) => {
    const dspActivities = activities.filter(a => a.staffId === dspId);
    
    const totalRating = dspActivities.reduce((sum, a) => sum + (a.progressRating || 0), 0);
    const avgProgressRating = dspActivities.length > 0 
      ? Math.round((totalRating / dspActivities.length) * 10) / 10 
      : 0;

    // Get unique goals this DSP has worked on
    const uniqueGoals = new Set(dspActivities.map(a => a.goalId));

    return {
      activitiesLogged: dspActivities.length,
      avgProgressRating,
      activeGoals: uniqueGoals.size,
      recentActivities: dspActivities.slice(0, 5)
    };
  };

  const getSuccessLevelColor = (level: string) => {
    switch (level) {
      case 'independent': return 'bg-green-100 text-green-800';
      case 'minimal_assist': return 'bg-blue-100 text-blue-800';
      case 'moderate_assist': return 'bg-yellow-100 text-yellow-800';
      case 'maximum_assist': return 'bg-orange-100 text-orange-800';
      case 'not_attempted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDsps = selectedDsp === 'all' 
    ? dsps 
    : dsps.filter(d => d.id === selectedDsp);

  // Calculate overall stats
  const totalActivities = activities.length;
  const totalDsps = dsps.length;
  const avgActivitiesPerDsp = totalDsps > 0 ? Math.round(totalActivities / totalDsps) : 0;
  const overallAvgRating = activities.length > 0
    ? Math.round((activities.reduce((sum, a) => sum + (a.progressRating || 0), 0) / activities.length) * 10) / 10
    : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">DSP Progress Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor Direct Support Professional performance and ISP goal activities</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active DSPs</p>
              <p className="text-2xl font-bold text-gray-900">{totalDsps}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
              <p className="text-xs text-gray-500 mt-1">Last {timeRange} days</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Activities/DSP</p>
              <p className="text-2xl font-bold text-gray-900">{avgActivitiesPerDsp}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className={`text-2xl font-bold ${getProgressRatingColor(overallAvgRating)}`}>
                {overallAvgRating}/5
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">DSP:</label>
            <select
              value={selectedDsp}
              onChange={(e) => setSelectedDsp(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All DSPs</option>
              {dsps.map(dsp => (
                <option key={dsp.id} value={dsp.id}>
                  {dsp.firstName} {dsp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* DSP Progress Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading DSP progress data...</p>
          </div>
        ) : filteredDsps.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No DSPs found</p>
          </div>
        ) : (
          filteredDsps.map((dsp) => {
            const stats = getDspStats(dsp.id);
            const isExpanded = expandedDsp === dsp.id;

            return (
              <div key={dsp.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedDsp(isExpanded ? null : dsp.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {dsp.firstName[0]}{dsp.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dsp.firstName} {dsp.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{dsp.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.activeGoals}</p>
                        <p className="text-xs text-gray-600">Active Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.activitiesLogged}</p>
                        <p className="text-xs text-gray-600">Activities</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getProgressRatingColor(stats.avgProgressRating)}`}>
                          {stats.avgProgressRating || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">Avg Rating</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-600" />
                      Recent Activities
                    </h4>

                    {stats.recentActivities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No activities logged in the selected time range</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentActivities.map((activity: any) => (
                          <div key={activity.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">
                                  {activity.goal?.title || 'Goal Activity'}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  Client: {activity.goal?.outcome?.client?.firstName} {activity.goal?.outcome?.client?.lastName}
                                </p>
                                <p className="text-sm text-gray-700">{activity.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 ml-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSuccessLevelColor(activity.successLevel)}`}>
                                  {activity.successLevel?.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-lg ${
                                        i < activity.progressRating
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(activity.activityDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.duration} minutes
                              </span>
                              <span className="capitalize">{activity.activityType?.replace('_', ' ')}</span>
                            </div>
                            
                            {activity.observations && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Observations:</span> {activity.observations}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {stats.recentActivities.length > 0 && (
                      <div className="mt-4 text-center">
                        <button 
                          onClick={() => {/* Would open full activity history modal */}}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View All Activities ({stats.activitiesLogged})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {dsps
              .map(dsp => ({ dsp, stats: getDspStats(dsp.id) }))
              .sort((a, b) => b.stats.avgProgressRating - a.stats.avgProgressRating)
              .slice(0, 5)
              .map(({ dsp, stats }, index) => (
                <div key={dsp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {dsp.firstName} {dsp.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {stats.activitiesLogged} activities
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getProgressRatingColor(stats.avgProgressRating)}`}>
                      {stats.avgProgressRating || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">Avg Rating</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Most Active
          </h3>
          <div className="space-y-3">
            {dsps
              .map(dsp => ({ dsp, stats: getDspStats(dsp.id) }))
              .sort((a, b) => b.stats.activitiesLogged - a.stats.activitiesLogged)
              .slice(0, 5)
              .map(({ dsp, stats }, index) => (
                <div key={dsp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {dsp.firstName} {dsp.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {stats.activeGoals} active goals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {stats.activitiesLogged}
                    </p>
                    <p className="text-xs text-gray-600">Activities</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">Using the DSP Progress Dashboard</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Monitor DSP performance on ISP goal activities in real-time</li>
                <li>Track activity completion rates and quality ratings</li>
                <li>Identify top performers and provide recognition</li>
                <li>Support DSPs who may need additional training or resources</li>
                <li>Use insights to improve overall service quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
