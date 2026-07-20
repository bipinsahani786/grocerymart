import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
  useChangePassword,
} from '../api/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  User, Camera, Trash2, Save, Lock, Mail, Phone, Shield,
  Calendar, Loader2, Eye, EyeOff, KeyRound, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, getFileUrl } from '@/lib/utils';

// ── Schemas ──
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional().or(z.literal('')),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Min 8 characters'),
  new_password_confirmation: z.string().min(8, 'Min 8 characters'),
}).refine((d) => d.new_password === d.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
});
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: profileData, isLoading } = useProfile();
  const profile = profileData?.data;

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const changePassword = useChangePassword();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');

  // ── Profile form ──
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

  // ── Handlers ──
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success('Avatar uploaded!');
    } catch {
      toast.error('Failed to upload avatar');
    }
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
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-10 space-y-8">
        <Skeleton className="h-[250px] w-full rounded-[2rem] bg-slate-200 dark:bg-white/5" />
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl bg-slate-200 dark:bg-white/5" />
          <Skeleton className="h-[400px] w-full rounded-[2rem] bg-slate-200 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      
      {/* ═══════════ Dynamic Hero Header ═══════════ */}
      <div className="relative h-[180px] w-full overflow-hidden">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-400 to-emerald-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        {/* Floating elements for depth */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/20 blur-[80px] rounded-full" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-black/10 blur-[60px] rounded-full" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 z-10">
          <Sparkles className="w-8 h-8 mb-4 opacity-70" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-center drop-shadow-md">
            Your Digital Identity
          </h1>
          <p className="text-white/80 mt-1 text-sm font-medium tracking-wide">Manage your settings, security, and preferences.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-20 -mt-12">
        
        {/* ═══════════ Central Avatar Block ═══════════ */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-md opacity-50 group-hover:opacity-70 transition duration-500" />
            <div className="w-24 h-24 rounded-full border-[4px] border-slate-50 dark:border-zinc-950 bg-card overflow-hidden relative shadow-xl z-10">
              {profile?.avatar ? (
                <img src={getFileUrl(profile.avatar)} alt="Avatar" className="w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-primary-500">
                  <span className="text-3xl font-black uppercase tracking-tighter">
                    {profile?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
                {profile?.avatar && (
                  <button onClick={handleRemoveAvatar} className="w-10 h-10 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {uploadAvatar.isPending && (
              <div className="absolute inset-0 z-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-[6px] border-transparent">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-foreground shadow-sm">
              <Shield className="w-3.5 h-3.5 text-primary-500" />
              {profile?.roles?.[0]?.name || profile?.roles?.[0] || 'User'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-foreground shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              {profile?.created_at ? format(new Date(profile.created_at), 'yyyy') : '—'}
            </span>
          </div>
        </div>

        {/* ═══════════ Tab Navigation ═══════════ */}
        <div className="flex bg-card p-1.5 rounded-2xl border border-border shadow-sm mb-8 relative">
          <div 
            className="absolute top-1.5 bottom-1.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl transition-all duration-300 ease-out border border-primary-500/20"
            style={{ 
              width: 'calc(50% - 6px)', 
              left: activeTab === 'personal' ? '6px' : 'calc(50% + 3px)' 
            }} 
          />
          <button 
            onClick={() => setActiveTab('personal')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors relative z-10 rounded-xl",
              activeTab === 'personal' ? "text-primary-600 dark:text-primary-400" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" /> Personal Details
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors relative z-10 rounded-xl",
              activeTab === 'security' ? "text-primary-600 dark:text-primary-400" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <KeyRound className="w-4 h-4" /> Security & Password
          </button>
        </div>

        {/* ═══════════ Tab Content ═══════════ */}
        <div className="bg-card border border-border rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none min-h-[400px]">
          
          {/* PERSONAL TAB */}
          <div className={cn("transition-all duration-500", activeTab === 'personal' ? "opacity-100 block animate-in fade-in slide-in-from-bottom-4" : "hidden opacity-0")}>
            <div className="mb-8 text-center sm:text-left border-b border-border pb-6">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Personal Details</h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Update your name, email, and contact number.</p>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-foreground/70 uppercase tracking-widest flex items-center ml-1">
                    <User className="w-3.5 h-3.5 mr-2" /> Full Name
                  </label>
                  <Input
                    {...profileForm.register('name')}
                    placeholder="Enter your name"
                    className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary-500 focus:bg-input-bg rounded-lg text-sm font-bold transition-all shadow-none"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-destructive font-bold ml-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-foreground/70 uppercase tracking-widest flex items-center ml-1">
                    <Mail className="w-3.5 h-3.5 mr-2" /> Email Address
                  </label>
                  <Input
                    {...profileForm.register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary-500 focus:bg-input-bg rounded-lg text-sm font-bold transition-all shadow-none"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-destructive font-bold ml-1">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black text-foreground/70 uppercase tracking-widest flex items-center ml-1">
                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone Number
                  </label>
                  <Input
                    {...profileForm.register('phone')}
                    placeholder="+1 (555) 000-0000"
                    className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary-500 focus:bg-input-bg rounded-lg text-sm font-bold transition-all shadow-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                  className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto px-6 h-10 text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
                >
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Profile
                </Button>
              </div>
            </form>
          </div>

          {/* SECURITY TAB */}
          <div className={cn("transition-all duration-500", activeTab === 'security' ? "opacity-100 block animate-in fade-in slide-in-from-bottom-4" : "hidden opacity-0")}>
            <div className="mb-6 text-center sm:text-left border-b border-border pb-4">
              <h2 className="text-xl font-black text-foreground tracking-tight">Security & Password</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Ensure your account stays secure by updating your password regularly.</p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-2xl mx-auto sm:mx-0">
              <div className="space-y-3">
                <label className="text-xs font-black text-foreground/70 uppercase tracking-widest ml-1">
                  Current Password
                </label>
                <div className="relative">
                    <Input
                      {...passwordForm.register('current_password')}
                      type={showCurrentPw ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary-500 focus:bg-input-bg rounded-lg text-sm font-bold pr-10 transition-all shadow-none"
                    />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-destructive font-bold ml-1">{passwordForm.formState.errors.current_password.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-foreground/70 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative">
                    <Input
                      {...passwordForm.register('new_password')}
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary-500 focus:bg-input-bg rounded-lg text-sm font-bold pr-10 transition-all shadow-none"
                    />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-destructive font-bold ml-1">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-foreground/70 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                  <Input
                    {...passwordForm.register('new_password_confirmation')}
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary-500 focus:bg-input-bg rounded-lg text-sm font-bold transition-all shadow-none"
                  />
                {passwordForm.formState.errors.new_password_confirmation && (
                  <p className="text-xs text-destructive font-bold ml-1">{passwordForm.formState.errors.new_password_confirmation.message}</p>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={changePassword.isPending || !passwordForm.formState.isDirty}
                  variant="outline"
                  className="w-full sm:w-auto px-6 h-10 text-xs font-black uppercase tracking-widest rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  {changePassword.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
