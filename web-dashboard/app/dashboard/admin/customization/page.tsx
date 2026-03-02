'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Palette, Building2, FileText, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomizationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'branding' | 'company' | 'features'>('branding');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.request('/api/organization/settings');
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.request('/api/organization/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, logoType: 'logo' | 'printLogo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('logoType', logoType);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organization/settings/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update settings with new logo URL
      setSettings((prev: any) => ({
        ...prev,
        [logoType === 'logo' ? 'logoUrl' : logoType === 'printLogo' ? 'printLogoUrl' : 'faviconUrl']: result.url
      }));

      alert('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      alert(`Failed to upload logo: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Failed to load organization settings</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'branding', name: 'Branding & Theme', icon: Palette },
    { id: 'company', name: 'Company Information', icon: Building2 },
    { id: 'features', name: 'Feature Settings', icon: Settings },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Customization</h1>
            <p className="text-gray-600 mt-1">Customize your organization's branding, information, and features</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Permission Notice */}
      {user?.role === 'admin' && !user?.isLandlord && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Admin Access</p>
              <p>You have full access to customize your organization's settings and branding.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Main Logo */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Main Logo</p>
                    <p className="text-xs text-gray-500 mb-3">Used in header and dashboard</p>
                    {settings.logoUrl && (
                      <img src={settings.logoUrl} alt="Logo" className="max-h-16 mx-auto mb-3" />
                    )}
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'logo')}
                      />
                    </label>
                  </div>

                  {/* Print Logo */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Print Logo</p>
                    <p className="text-xs text-gray-500 mb-3">Used on printed documents</p>
                    {settings.printLogoUrl && (
                      <img src={settings.printLogoUrl} alt="Print Logo" className="max-h-16 mx-auto mb-3" />
                    )}
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'printLogo')}
                      />
                    </label>
                  </div>

                  {/* Favicon */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Favicon</p>
                    <p className="text-xs text-gray-500 mb-3">Browser tab icon (32x32px)</p>
                    {settings.faviconUrl && (
                      <img src={settings.faviconUrl} alt="Favicon" className="max-h-16 mx-auto mb-3" />
                    )}
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'favicon')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.primaryColor || '#3B82F6'}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="h-10 w-20 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor || '#3B82F6'}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.secondaryColor || '#10B981'}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="h-10 w-20 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor || '#10B981'}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.accentColor || '#8B5CF6'}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="h-10 w-20 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={settings.accentColor || '#8B5CF6'}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={settings.fontFamily || 'Inter'}
                    onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Company Information Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={settings.companyName || ''}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Your company tagline"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={settings.addressLine1 || ''}
                    onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Street address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={settings.addressLine2 || ''}
                    onChange={(e) => setSettings({ ...settings, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Suite, apartment, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={settings.city || ''}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={settings.state || ''}
                    onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={settings.zipCode || ''}
                    onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={settings.website || ''}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enabled Modules</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select which modules are available to your organization
                </p>
                <div className="space-y-3">
                  {['ISP Goals', 'Schedules', 'Tasks', 'Violations', 'Incidents', 'Forms', 'Reports'].map((module) => (
                    <label key={module} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">{module}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Module management is coming soon. All modules are currently enabled by default.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );
}
