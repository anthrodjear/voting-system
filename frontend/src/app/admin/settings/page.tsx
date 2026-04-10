'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Select, Badge, Alert } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api-client';

interface GeneralSettings {
  systemName: string;
  timezone: string;
  language: string;
  dateFormat: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  electionAlerts: boolean;
  systemUpdates: boolean;
  dailyDigest: boolean;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
  ipWhitelist: boolean;
  auditLogging: boolean;
}

interface AppearanceSettings {
  theme: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

interface AllSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

const defaultSettings: AllSettings = {
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
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get<AllSettings>('/settings');
        if (response) {
          setSettings(response);
          // Sync theme from loaded settings
          if (response.appearance.theme !== theme) {
            setTheme(response.appearance.theme as 'light' | 'dark' | 'system');
          }
        }
      } catch (err: any) {
        // Fall back to defaults if API fails
        console.warn('Failed to load settings from API, using defaults:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Save settings to backend API
      await api.patch('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Manage your system preferences and configurations
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-neutral-400" />
          <span className="ml-3 text-neutral-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your system preferences and configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <Badge variant="error" className="animate-fade-in">
              {saveError}
            </Badge>
          )}
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
                    ? 'bg-admin-100 text-admin-700 dark:bg-admin-900/50 dark:text-admin-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
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
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">General Settings</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
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
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Notification Preferences</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Manage how you receive notifications and alerts
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <DevicePhoneMobileIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
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
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.label}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.notifications[item.key as keyof typeof settings.notifications]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200 dark:bg-neutral-700'
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

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
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
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.label}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.notifications[item.key as keyof typeof settings.notifications]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200 dark:bg-neutral-700'
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
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Security Settings</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Configure security policies and access controls
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    Authentication
                  </h3>
                  <div className="space-y-3 ml-7">
                    {[
                      { key: 'twoFactorRequired', label: 'Require Two-Factor Authentication', description: 'All administrators must enable 2FA' },
                      { key: 'auditLogging', label: 'Audit Logging', description: 'Log all admin actions for review' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.label}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('security', item.key, !settings.security[item.key as keyof typeof settings.security])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.security[item.key as keyof typeof settings.security]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200 dark:bg-neutral-700'
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

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <KeyIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
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

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    Network Security
                  </h3>
                  <div className="ml-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">IP Whitelist</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Restrict access to specific IP addresses</p>
                      </div>
                      <button
                        onClick={() => updateSettings('security', 'ipWhitelist', !settings.security.ipWhitelist)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          settings.security.ipWhitelist
                            ? 'bg-admin-500'
                            : 'bg-neutral-200 dark:bg-neutral-700'
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
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Appearance</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Customize the look and feel of your dashboard
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <PaintBrushIcon className="w-5 h-5 text-neutral-500" />
                    Theme
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 ml-7">
                    {[
                      { value: 'light' as const, label: 'Light', icon: SunIcon, bg: 'bg-white dark:bg-neutral-800', border: 'border-neutral-200 dark:border-neutral-600' },
                      { value: 'dark' as const, label: 'Dark', icon: MoonIcon, bg: 'bg-neutral-900', border: 'border-neutral-700' },
                      { value: 'system' as const, label: 'System', icon: ComputerDesktopIcon, bg: 'bg-gradient-to-r from-white to-neutral-900 dark:from-neutral-800 dark:to-neutral-900', border: 'border-neutral-300 dark:border-neutral-600' },
                    ].map((themeOption) => {
                      const isActive = theme === themeOption.value;
                      return (
                        <button
                          key={themeOption.value}
                          onClick={() => setTheme(themeOption.value)}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all text-left relative',
                            isActive
                              ? 'border-admin-500 ring-2 ring-admin-100 dark:ring-admin-900'
                              : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                          )}
                        >
                          {isActive && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-admin-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className={cn('w-full h-16 rounded-lg mb-3 flex items-center justify-center', themeOption.bg)}>
                            <themeOption.icon className={cn('w-6 h-6', themeOption.value === 'dark' ? 'text-neutral-400' : 'text-neutral-500')} />
                          </div>
                          <p className={cn('font-medium', themeOption.value === 'dark' ? 'text-neutral-100' : 'text-neutral-900 dark:text-neutral-100')}>
                            {themeOption.label}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {themeOption.value === 'light' && 'Always use light theme'}
                            {themeOption.value === 'dark' && 'Always use dark theme'}
                            {themeOption.value === 'system' && 'Follow system preference'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
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
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.label}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings('appearance', item.key, !settings.appearance[item.key as keyof typeof settings.appearance])}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            settings.appearance[item.key as keyof typeof settings.appearance]
                              ? 'bg-admin-500'
                              : 'bg-neutral-200 dark:bg-neutral-700'
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
