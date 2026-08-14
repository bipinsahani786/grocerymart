import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { useToast } from './useToast';

/**
 * Single Responsibility: Manages user profile fetching, form state, and profile updates.
 */
export function useProfile() {
  const { user, accessToken, updateUser, logout } = useAuthContext();
  const { toast, triggerToast, dismissToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setDob(user.dob || '');
    }
  }, [user]);

  // Fetch latest profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      try {
        const result = await authService.getProfile(accessToken);
        if (result.success && result.data) {
          updateUser(result.data);
          setName(result.data.name || '');
          setEmail(result.data.email || '');
          setDob(result.data.dob || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile details:', err);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleUpdateProfile = async (): Promise<boolean> => {
    if (!name.trim()) {
      triggerToast('Name is required.', 'error');
      return false;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      triggerToast('Please enter a valid email address.', 'error');
      return false;
    }

    if (!accessToken) {
      triggerToast('Authentication session expired. Please log in again.', 'error');
      return false;
    }

    setLoading(true);

    try {
      const result = await authService.updateProfile(accessToken, {
        name: name.trim(),
        email: email.trim() || undefined,
        dob: dob.trim() || undefined,
      });

      if (result.success && result.data) {
        updateUser(result.data);
        setIsEditing(false);
        triggerToast('Profile updated successfully!', 'success');
        return true;
      } else {
        triggerToast(result.error || result.message || 'Failed to update profile.', 'error');
        return false;
      }
    } catch {
      triggerToast('Network connection error. Please try again.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    name,
    setName,
    email,
    setEmail,
    dob,
    setDob,
    isEditing,
    setIsEditing,
    loading,
    toast,
    triggerToast,
    dismissToast,
    handleUpdateProfile,
    logout,
  };
}
