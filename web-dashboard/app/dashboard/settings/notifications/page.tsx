'use client';

import { useState, useEffect } from 'react';
import { Bell, Save, TestTube, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  appointmentRequests: boolean;
  appointmentApprovals: boolean;
  taskAssignments: boolean;
  scheduleChanges: boolean;
  incidentReports: boolean;
  ticketUpdates: boolean;
  violationAlerts: boolean;
  systemAnnouncements: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  digestFrequency: string;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch preferences
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      showMessage('error', 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailEnabled: preferences.emailEnabled,
          inAppEnabled: preferences.inAppEnabled,
          appointmentRequests: preferences.appointmentRequests,
          appointmentApprovals: preferences.appointmentApprovals,
          taskAssignments: preferences.taskAssignments,
          scheduleChanges: preferences.scheduleChanges,
          incidentReports: preferences.incidentReports,
          ticketUpdates: preferences.ticketUpdates,
          violationAlerts: preferences.violationAlerts,
          systemAnnouncements: preferences.systemAnnouncements,
          quietHoursStart: preferences.quietHoursStart,
          quietHoursEnd: preferences.quietHoursEnd,
          digestFrequency: preferences.digestFrequency
        })
      });

      if (response.ok) {
        showMessage('success', 'Preferences saved successfully');
      } else {
        showMessage('error', 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    setSendingTest(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showMessage('success', 'Test notification sent! Check your notifications.');
      } else {
        showMessage('error', 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showMessage('error', 'Failed to send test notification');
    } finally {
      setSendingTest(false);
    }
  };

  // Show message
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Update preference
  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  // Fetch on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Failed to load preferences</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-sm text-gray-500">
                Manage how and when you receive notifications
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/notifications"
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
             Back to Notifications
          </Link>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Notification Channels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h2>
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <button
              onClick={() => updatePreference('emailEnabled', !preferences.emailEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* In-App Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">In-App Notifications</h3>
              <p className="text-sm text-gray-500">Show notifications in the dashboard</p>
            </div>
            <button
              onClick={() => updatePreference('inAppEnabled', !preferences.inAppEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.inAppEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.inAppEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h2>
        <p className="text-sm text-gray-500 mb-4">Choose which events you want to be notified about</p>
        
        <div className="space-y-3">
          {[
            { key: 'appointmentRequests', label: ' Appointment Requests', description: 'New appointment requests and updates' },
            { key: 'appointmentApprovals', label: ' Appointment Approvals', description: 'When appointments are approved or rejected' },
            { key: 'taskAssignments', label: ' Task Assignments', description: 'When tasks are assigned to you' },
            { key: 'scheduleChanges', label: ' Schedule Changes', description: 'Changes to your schedule' },
            { key: 'incidentReports', label: ' Incident Reports', description: 'New incident reports' },
            { key: 'ticketUpdates', label: ' Support Ticket Updates', description: 'Updates on support tickets' },
            { key: 'violationAlerts', label: ' Violation Alerts', description: 'Compliance violation notifications' },
            { key: 'systemAnnouncements', label: ' System Announcements', description: 'Important system updates' }
          ].map(({ key, label, description }) => (
            <label key={key} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={preferences[key as keyof NotificationPreferences] as boolean}
                onChange={(e) => updatePreference(key as keyof NotificationPreferences, e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h2>
        <p className="text-sm text-gray-500 mb-4">Don't send notifications during these hours</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={preferences.quietHoursStart || '22:00'}
              onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={preferences.quietHoursEnd || '08:00'}
              onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Digest Frequency */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Digest Frequency</h2>
        <p className="text-sm text-gray-500 mb-4">Receive a summary of notifications</p>
        
        <select
          value={preferences.digestFrequency}
          onChange={(e) => updatePreference('digestFrequency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="never">Never - Get notifications immediately</option>
          <option value="daily">Daily - Once per day</option>
          <option value="weekly">Weekly - Once per week</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={sendTestNotification}
          disabled={sendingTest}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <TestTube className="w-4 h-4" />
          {sendingTest ? 'Sending...' : 'Send Test Notification'}
        </button>

        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
