import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
  useChangePassword,
} from '../api/useProfile';
import { profileSchema, passwordSchema } from '../schemas/profileSchema';
import type { ProfileValues, PasswordValues } from '../schemas/profileSchema';
import { AVATAR_UPLOAD_FOLDER } from '../constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { FormField } from '@/components/ui/form-field';
import { toast } from 'sonner';
import {
  User, Save, Lock, Mail, Phone, Shield,
  Loader2, KeyRound, Camera, Trash2,
} from 'lucide-react';
import { getFileUrl } from '@/lib/utils';

export default function ProfilePage() {
  const { data: profileData, isLoading } = useProfile();
  const profile = profileData?.data;

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const onProfileSubmit = async (data: ProfileValues) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    try {
      await changePassword.mutateAsync(data);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      const msg = error.response?.data?.errors?.current_password?.[0]
        || error.response?.data?.message
        || 'Failed to change password';
      toast.error(msg);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        let compressedDataUrl = '';
        if (ctx) {
          ctx.drawImage(img, 0, 0, 160, 160);
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        } else {
          compressedDataUrl = event.target?.result as string;
        }

        uploadAvatar.mutate(compressedDataUrl, {
          onSuccess: () => {
            toast.success('Avatar updated successfully!');
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update avatar');
          },
        });
      };

      img.onerror = () => {
        toast.error('Failed to process image file');
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      toast.error('Failed to read image file');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar.mutateAsync();
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 text-foreground">
      <PageHeader
        title="My Profile"
        breadcrumb={['Home', 'Account Settings']}
      />

      <div className="w-full px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl">
        {/* ── Personal Information ── */}
        <SectionCard title="Personal Information" icon={<User />}>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md">
                {profile?.avatar ? (
                  <img src={getFileUrl(profile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400 uppercase">
                    {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
                  </span>
                )}
              </div>

              <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm cursor-pointer transition-colors" title="Change Avatar">
                <Camera className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadAvatar.isPending}
                  className="hidden"
                />
              </label>

              {uploadAvatar.isPending && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{profile?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              {profile?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={removeAvatar.isPending}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Remove Photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3">
            <FormField label="Full Name" error={profileForm.formState.errors.name?.message} required>
              <Input {...profileForm.register('name')} placeholder="Enter your name" icon={<User />} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Email Address" error={profileForm.formState.errors.email?.message} required>
                <Input {...profileForm.register('email')} type="email" placeholder="you@example.com" icon={<Mail />} />
              </FormField>
              <FormField label="Mobile Number (10 Digits)" error={profileForm.formState.errors.phone?.message}>
                <Input
                  {...profileForm.register('phone', {
                    onChange: (e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      profileForm.setValue('phone', val, { shouldValidate: true, shouldDirty: true });
                    }
                  })}
                  maxLength={10}
                  placeholder="9876543210"
                  icon={<Phone />}
                />
              </FormField>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                className="bg-primary-600 hover:bg-primary-700 text-white h-9 px-4 text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              >
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </SectionCard>

        {/* ── Security ── */}
        <SectionCard title="Security" icon={<Lock />} className="h-fit">
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
            <FormField label="Current Password" error={passwordForm.formState.errors.current_password?.message} required>
              <Input {...passwordForm.register('current_password')} type="password" placeholder="Enter current password" icon={<KeyRound />} />
            </FormField>
            <FormField label="New Password" error={passwordForm.formState.errors.new_password?.message} required>
              <Input {...passwordForm.register('new_password')} type="password" placeholder="Minimum 6 characters" icon={<KeyRound />} />
            </FormField>
            <FormField label="Confirm Password" error={passwordForm.formState.errors.new_password_confirmation?.message} required>
              <Input {...passwordForm.register('new_password_confirmation')} type="password" placeholder="Repeat new password" icon={<Shield />} />
            </FormField>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={changePassword.isPending || !passwordForm.formState.isDirty}
                className="bg-primary-600 hover:bg-primary-700 text-white h-9 px-4 text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              >
                {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </Button>
            </div>
          </form>
        </SectionCard>
        </div>
      </div>
    </div>
  );
}
