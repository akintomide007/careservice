'use client';

import { useState, useEffect } from 'react';
import { Bell, Filter, Trash2, CheckCheck, Settings } from 'lucide-react';
import Link from 'next/link';
import NotificationItem from '@/components/NotificationItem';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20;

  // Fetch notifications
  const fetchNotifications = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
      });

      if (filter === 'unread') params.append('isRead', 'false');
      if (filter === 'read') params.append('isRead', 'true');
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`${API_URL}/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setNotifications(data);
          setPage(1);
        } else {
          setNotifications(prev => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all read notifications
  const clearAllRead = async () => {
    if (!confirm('Are you sure you want to clear all read notifications? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => !n.isRead));
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Load more
  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchNotifications(true);
  }, [filter, typeFilter, priorityFilter]);

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchNotifications(false);
    }
  }, [page]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/settings/notifications"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-2">
              {['all', 'unread', 'read'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="appointment_request_submitted">Appointment Requests</option>
              <option value="task_assigned">Task Assignments</option>
              <option value="ticket_created">Support Tickets</option>
              <option value="incident_reported">Incidents</option>
              <option value="violation_recorded">Violations</option>
              <option value="schedule_changed">Schedule Changes</option>
              <option value="system_announcement">Announcements</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent"> Urgent</option>
              <option value="high"> High</option>
              <option value="normal"> Normal</option>
              <option value="low"> Low</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
            {notifications.some(n => n.isRead) && (
              <button
                onClick={clearAllRead}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all read
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? 'No read notifications found.'
                : 'You have no notifications yet.'}
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
