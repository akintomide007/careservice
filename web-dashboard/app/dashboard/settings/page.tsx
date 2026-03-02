'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Bell, Lock, Palette, Globe, Shield, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const settingsCategories = [
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Update your personal information and contact details',
      color: 'blue',
      available: true,
      action: () => alert('Profile settings coming soon!')
    },
    {
      icon: Bell,
      title: 'Notification Preferences',
      description: 'Manage how and when you receive notifications',
      color: 'purple',
      available: true,
      action: () => router.push('/dashboard/settings/notifications')
    },
    {
      icon: Lock,
      title: 'Security & Privacy',
      description: 'Change password and manage security settings',
      color: 'red',
      available: true,
      action: () => alert('Security settings coming soon!')
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize theme, colors, and display preferences',
      color: 'pink',
      available: false,
      action: () => {}
    },
    {
      icon: Globe,
      title: 'Language & Region',
      description: 'Set your preferred language, timezone, and date format',
      color: 'green',
      available: false,
      action: () => {}
    },
    {
      icon: Database,
      title: 'Data & Storage',
      description: 'Manage your data, backups, and storage usage',
      color: 'yellow',
      available: false,
      action: () => {}
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      pink: 'bg-pink-100 text-pink-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Settings Categories</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settingsCategories.map((setting, index) => {
              const Icon = setting.icon;
              return (
                <div
                  key={index}
                  onClick={setting.available ? setting.action : undefined}
                  className={`border border-gray-200 rounded-lg p-4 transition-all ${
                    setting.available
                      ? 'hover:shadow-md cursor-pointer hover:border-blue-300'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${getColorClasses(setting.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      setting.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {setting.available ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{setting.title}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Shield className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Account Security</h3>
          <p className="text-sm text-gray-600 mb-3">
            Last password change: 30 days ago
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Change Password 
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <Bell className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Notifications</h3>
          <p className="text-sm text-gray-600 mb-3">
            Manage your notification preferences
          </p>
          <button 
            onClick={() => router.push('/dashboard/settings/notifications')}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Configure 
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <User className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Profile Complete</h3>
          <p className="text-sm text-gray-600 mb-3">
            Your profile is 100% complete
          </p>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            View Profile 
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">Need Help?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>If you need assistance with your settings or have questions about your account, please contact your administrator or submit a support ticket.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
