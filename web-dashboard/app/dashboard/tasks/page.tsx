'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string; priority?: string }>({});

  useEffect(() => {
    loadTasks();
    loadStatistics();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks(filter);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await api.getTaskStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await api.startTask(taskId);
      loadTasks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const notes = prompt('Completion notes (optional):');
    const hours = prompt('Actual hours spent:');
    
    try {
      await api.completeTask(taskId, {
        completionNotes: notes || undefined,
        actualHours: hours ? parseFloat(hours) : undefined
      });
      loadTasks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Manage your assigned tasks</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Tasks</div>
            <div className="text-2xl font-bold">{statistics.totalTasks || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-gray-600">{statistics.pendingTasks || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.inProgressTasks || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">{statistics.completedTasks || 0}</div>
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filter.priority || ''}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value || undefined })}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setFilter({})}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No tasks found</p>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {isOverdue(task.dueDate) && task.status !== 'completed' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {task.client && (
                        <span> {task.client.firstName} {task.client.lastName}</span>
                      )}
                      <span> Est: {task.estimatedHours}h</span>
                      {task.actualHours && (
                        <span> Actual: {task.actualHours}h</span>
                      )}
                    </div>

                    {task.checklistItems && task.checklistItems.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">Checklist:</p>
                        <div className="space-y-1">
                          {task.checklistItems.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => api.toggleChecklistItem(item.id, !item.isCompleted).then(loadTasks)}
                                className="rounded"
                              />
                              <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                {item.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Complete
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
