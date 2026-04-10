'use client';

import { useState, useEffect } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PencilIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { getProfile, updateProfile } from '@/services/voter';
import type { VoterProfile } from '@/types';
import { formatDate } from '@/lib/utils';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info'; icon: any }> = {
  verified: { label: 'Verified', variant: 'success', icon: CheckCircleIcon },
  registered: { label: 'Registered', variant: 'info', icon: CheckCircleIcon },
  pending_biometrics: { label: 'Pending Biometrics', variant: 'warning', icon: ClockIcon },
  pending: { label: 'Pending', variant: 'warning', icon: ClockIcon },
  rejected: { label: 'Rejected', variant: 'error', icon: ExclamationCircleIcon },
  suspended: { label: 'Suspended', variant: 'error', icon: ExclamationCircleIcon },
};

export default function VoterProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<VoterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setEditForm({
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateProfile(editForm);
      setProfile(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setEditForm({
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-voter-500 mx-auto mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-error-dark font-medium mb-2">Failed to load profile</p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">No profile data found</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[profile.registrationStatus] || { label: profile.registrationStatus, variant: 'info' as const, icon: ClockIcon };
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Profile</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">View and manage your voter information</p>
        </div>
        {!editing && (
          <Button
            variant="secondary"
            leftIcon={<PencilIcon className="w-4 h-4" />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-error-light border-l-4 border-error rounded-r-lg">
          <div className="flex items-center gap-2 text-error-dark">
            <ExclamationCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Status Card */}
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-voter-100 dark:bg-voter-900/50 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-voter-500 dark:text-voter-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={status.variant}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{status.label}</span>
              </Badge>
              {profile.nationalIdVerified && (
                <Badge variant="success">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>ID Verified</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm">
              <IdentificationIcon className="w-4 h-4" />
              <span>National ID</span>
            </div>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">{profile.nationalId}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm">
              <CalendarIcon className="w-4 h-4" />
              <span>Date of Birth</span>
            </div>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">
              {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided'}
            </p>
          </div>

          {editing ? (
            <>
              <Input
                label="Email Address"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                type="email"
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              />
              <Input
                label="Phone Number"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                type="tel"
                leftIcon={<PhoneIcon className="w-5 h-5" />}
              />
              <div className="md:col-span-2 flex gap-3">
                <Button onClick={handleSave} loading={saving} variant="primary">
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="ghost">
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {profile.email || 'Not provided'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm">
                  <PhoneIcon className="w-4 h-4" />
                  <span>Phone Number</span>
                </div>
                <p className="text-neutral-900 dark:text-neutral-100 font-medium">{profile.phoneNumber}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Geographic Information */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          <MapPinIcon className="w-5 h-5 inline mr-2" />
          Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">County</p>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">
              {profile.countyName || 'Not set'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Constituency</p>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">
              {profile.constituencyName || 'Not set'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Ward</p>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">
              {profile.wardName || 'Not set'}
            </p>
          </div>
        </div>
      </Card>

      {/* Biometric Status */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
          Biometric Enrollment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              profile.biometric?.faceEnrolled
                ? 'bg-success/20 text-success-dark dark:text-success'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400'
            }`}>
              <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Face Recognition</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {profile.biometric?.faceEnrolled ? 'Enrolled' : 'Not enrolled'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              profile.biometric?.fingerprintEnrolled
                ? 'bg-success/20 text-success-dark dark:text-success'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400'
            }`}>
              <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Fingerprint</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {profile.biometric?.fingerprintEnrolled ? 'Enrolled' : 'Not enrolled'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Details */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Registration Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Registered At</p>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">
              {profile.registeredAt ? formatDate(profile.registeredAt) : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Verified At</p>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium">
              {profile.verifiedAt ? formatDate(profile.verifiedAt) : 'Not yet verified'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Voter ID</p>
            <p className="text-neutral-900 dark:text-neutral-100 font-mono text-sm">{profile.id}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
