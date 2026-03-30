'use client';

import { useState } from 'react';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Select, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock settings data
const initialSettings = {
  general: {
    systemName: 'IEBC Blockchain Voting System',
    timezone: 'Africa/Nairobi',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    electionAlerts: true,
    systemUpdates: true,
    dailyDigest: true,
  },
  security: {
    twoFactorRequired: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    ipWhitelist: false,
    auditLogging: true,
  },
  appearance: {
    theme: 'system',
    sidebarCollapsed: false,
    compactMode: false,
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSettings = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-500 mt-1">
            Manage your system preferences and configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <Badge variant="success" className="animate-fade-in">
              Settings saved successfully
            </Badge>
          )}
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 p-3 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                  'transition-all duration-150',
                  activeTab === tab.id
                    ? 'bg-admin-100 text-admin-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">General Settings</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Configure basic system information and preferences
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="System Name"
                    value={settings.general.systemName}
                    onChange={(e) => updateSettings('general', 'systemName', e.target.value)}
                  />
                  <Select
                    label="Timezone"
                    value={settings.general.timezone}
                    onChange={(value) => updateSettings('general', 'timezone', value)}
                    options={[
                      { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
                      { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
                      { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
                    ]}
                  />
                  <Select
                    label="Language"
                    value={settings.general.language}
                    onChange={(value) => updateSettings('general', 'language', value)}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'sw', label: 'Swahili' },
                    ]}
                  />
                  <Select
                    label="Date Format"
                    value={settings.general.dateFormat}
                    onChange={(value) => updateSettings('general', 'dateFormat', value)}
                    options={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Manage how you receive notifications and alerts
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <DevicePhoneMobileIcon className="w-5 h-5 text-neutral-500" />
                    Notification Channels
                  </h3>
                  <div className="space-y-3 ml-7">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive critical alerts via SMS' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.notifications[item.key as keyof typeof settings.notifications]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                              settings.notifications[item.key as keyof typeof settings.notifications]
                                ? 'translate-x-6'
                                : 'translate-x-0'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-neutral-500" />
                    Alert Types
                  </h3>
                  <div className="space-y-3 ml-7">
                    {[
                      { key: 'electionAlerts', label: 'Election Alerts', description: 'Updates about election status changes' },
                      { key: 'systemUpdates', label: 'System Updates', description: 'Maintenance and feature updates' },
                      { key: 'dailyDigest', label: 'Daily Digest', description: 'Daily summary of system activity' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.notifications[item.key as keyof typeof settings.notifications]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                              settings.notifications[item.key as keyof typeof settings.notifications]
                                ? 'translate-x-6'
                                : 'translate-x-0'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Security Settings</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Configure security policies and access controls
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-neutral-500" />
                    Authentication
                  </h3>
                  <div className="space-y-3 ml-7">
                    {[
                      { key: 'twoFactorRequired', label: 'Require Two-Factor Authentication', description: 'All administrators must enable 2FA' },
                      { key: 'auditLogging', label: 'Audit Logging', description: 'Log all admin actions for review' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('security', item.key, !settings.security[item.key as keyof typeof settings.security])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.security[item.key as keyof typeof settings.security]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                              settings.security[item.key as keyof typeof settings.security]
                                ? 'translate-x-6'
                                : 'translate-x-0'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <KeyIcon className="w-5 h-5 text-neutral-500" />
                    Session & Password
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 ml-7">
                    <Select
                      label="Session Timeout (minutes)"
                      value={settings.security.sessionTimeout}
                      onChange={(value) => updateSettings('security', 'sessionTimeout', value)}
                      options={[
                        { value: '15', label: '15 minutes' },
                        { value: '30', label: '30 minutes' },
                        { value: '60', label: '1 hour' },
                        { value: '120', label: '2 hours' },
                      ]}
                    />
                    <Select
                      label="Password Expiry (days)"
                      value={settings.security.passwordExpiry}
                      onChange={(value) => updateSettings('security', 'passwordExpiry', value)}
                      options={[
                        { value: '30', label: '30 days' },
                        { value: '60', label: '60 days' },
                        { value: '90', label: '90 days' },
                        { value: '180', label: '180 days' },
                        { value: '365', label: 'Never' },
                      ]}
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-neutral-500" />
                    Network Security
                  </h3>
                  <div className="ml-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">IP Whitelist</p>
                        <p className="text-sm text-neutral-500">Restrict access to specific IP addresses</p>
                      </div>
                      <button
                        onClick={() => updateSettings('security', 'ipWhitelist', !settings.security.ipWhitelist)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          settings.security.ipWhitelist
                            ? 'bg-admin-500'
                            : 'bg-neutral-200'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                            settings.security.ipWhitelist
                              ? 'translate-x-6'
                              : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Appearance</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Customize the look and feel of your dashboard
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <PaintBrushIcon className="w-5 h-5 text-neutral-500" />
                    Theme
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 ml-7">
                    {[
                      { value: 'light', label: 'Light', bg: 'bg-white', border: 'border-neutral-200' },
                      { value: 'dark', label: 'Dark', bg: 'bg-neutral-900', border: 'border-neutral-700' },
                      { value: 'system', label: 'System', bg: 'bg-gradient-to-r from-white to-neutral-900', border: 'border-neutral-300' },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => updateSettings('appearance', 'theme', theme.value)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          settings.appearance.theme === theme.value
                            ? 'border-admin-500 ring-2 ring-admin-100'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <div className={cn('w-full h-16 rounded-lg mb-3', theme.bg)} />
                        <p className="font-medium text-neutral-900">{theme.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5 text-neutral-500" />
                    Display Options
                  </h3>
                  <div className="space-y-3 ml-7">
                    {[
                      { key: 'sidebarCollapsed', label: 'Collapse Sidebar by Default', description: 'Start with a collapsed sidebar' },
                      { key: 'compactMode', label: 'Compact Mode', description: 'Use smaller spacing and fonts' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('appearance', item.key, !settings.appearance[item.key as keyof typeof settings.appearance])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.appearance[item.key as keyof typeof settings.appearance]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                              settings.appearance[item.key as keyof typeof settings.appearance]
                                ? 'translate-x-6'
                                : 'translate-x-0'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
