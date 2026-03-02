'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment_request_submitted':
    case 'appointment_request_approved':
    case 'appointment_request_rejected':
    case 'appointment_scheduled':
      return '';
    case 'task_assigned':
    case 'task_due_soon':
      return '';
    case 'incident_reported':
      return '';
    case 'ticket_created':
    case 'ticket_assigned':
    case 'ticket_updated':
    case 'ticket_resolved':
      return '';
    case 'schedule_changed':
      return '';
    case 'violation_recorded':
      return '';
    case 'system_announcement':
      return '';
    default:
      return '';
  }
};

// Get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'normal':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false
}: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const priorityColor = getPriorityColor(notification.priority);

  // Format relative time
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const handleAction = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 text-2xl ${compact ? '' : 'mt-1'}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Title */}
              <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white`}>
                {notification.title}
              </h4>

              {/* Message */}
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {notification.message}
              </p>

              {/* Time */}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {timeAgo}
              </p>

              {/* Action Button */}
              {notification.actionUrl && notification.actionLabel && (
                <div className="mt-2">
                  <Link
                    href={notification.actionUrl}
                    onClick={handleAction}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {notification.actionLabel}
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!compact && (
            <div className="mt-2 flex items-center gap-3">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Priority indicator (only for urgent/high) */}
      {(notification.priority === 'urgent' || notification.priority === 'high') && !compact && (
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${priorityColor}`}>
            {notification.priority === 'urgent' && ''}
            {notification.priority === 'high' && ''}
            <span className="ml-1 capitalize">{notification.priority} Priority</span>
          </span>
        </div>
      )}
    </div>
  );
}
