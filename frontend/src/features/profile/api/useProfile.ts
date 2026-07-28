import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  roles: string[];
  created_at: string;
}

// ── Get profile ──
export const useProfile = () => {
  return useQuery<{ data: ProfileData }>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/profile');
      return data;
    },
  });
};

// ── Update profile (name, email, phone) ──
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async (data: { name?: string; email?: string; phone?: string }) => {
      const response = await api.patch('/auth/profile', data);
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
    },
  });
};

// ── Upload avatar ──
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await api.patch('/auth/profile', { avatar: avatarUrl });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data.avatar) {
        updateUser({ avatar: data.avatar });
      }
    },
  });
};

// ── Remove avatar ──
export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async () => {
      await api.delete('/auth/profile/avatar');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser({ avatar: null });
    },
  });
};

// ── Change password ──
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    },
  });
};
