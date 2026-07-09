import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Eye, EyeOff, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useLogin, useRegister, useVerifyRegisterOtp } from '../api/useAuthMutations';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { AuthFormSkeleton } from './AuthFormSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Higher Order Component to add Skeleton aesthetic
const withSkeleton = (Component: React.FC<any>) => {
  return function WrappedComponent(props: any) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Modern aesthetic: brief skeleton flash when transitioning forms
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }, []);

    if (loading) return <AuthFormSkeleton />;
    return <Component {...props} />;
  }
}

// --- LOGIN PASSWORD FORM ---
export const LoginForm = withSkeleton(() => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { email: '', password: '' }
  });
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: any) => {
    loginMutation.mutate({ email: data.email, password: data.password }, {
      onSuccess: (res) => {
        setAuth(res.data.user, res.data.accessToken);
        const role = res.data.user.role || res.data.user.userType;
        const isSuperadmin = role === 'super_admin' || role === 'admin';
        const isStoreManager = role === 'store_manager';

        navigate(isSuperadmin ? '/dashboard' : isStoreManager ? '/store/dashboard' : '/login', { replace: true });
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Login failed';
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Username / Email field */}
      <div className="space-y-1.5 animate-in fade-in slide-in-from-left-6 duration-500 [animation-delay:100ms]">
        <label htmlFor="email" className="text-sm font-semibold text-slate-800 dark:text-white/90 tracking-wide select-none ml-1">Email Address</label>
        <div className="relative flex items-center bg-slate-100/80 dark:bg-primary-950/45 border-2 border-slate-200 dark:border-primary-700/30 rounded-xl px-2 py-1 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white shrink-0 shadow-md">
            <User size={15} />
          </div>
          <input 
            id="email"
            type="email"
            {...form.register('email', { required: 'Email is required' })} 
            placeholder="admin@grocerymart.com"
            className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 focus:outline-none w-full px-3 text-sm placeholder-slate-400 dark:placeholder-white/35 font-medium"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-1.5 animate-in fade-in slide-in-from-right-6 duration-500 [animation-delay:200ms]">
        <label htmlFor="password" className="text-sm font-semibold text-slate-800 dark:text-white/90 tracking-wide select-none ml-1">Password</label>
        <div className="relative flex items-center bg-slate-100/80 dark:bg-primary-950/45 border-2 border-slate-200 dark:border-primary-700/30 rounded-xl px-2 py-1 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white shrink-0 shadow-md">
            <Lock size={15} />
          </div>
          <input 
            id="password"
            type={showPassword ? "text" : "password"}
            {...form.register('password', { required: 'Password is required' })} 
            placeholder="••••••••"
            className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 focus:outline-none w-full px-3 text-sm placeholder-slate-400 dark:placeholder-white/35 font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 dark:text-white/60 hover:text-slate-600 dark:hover:text-white mr-2 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-500 [animation-delay:300ms] px-1">
        <div className="flex items-center gap-2">
          <input 
            id="remember-me"
            type="checkbox"
            className="h-3.5 w-3.5 rounded border border-slate-300 dark:border-primary-700/35 bg-slate-100 dark:bg-primary-950/40 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
          />
          <label htmlFor="remember-me" className="text-xs text-slate-600 dark:text-white/85 font-medium select-none cursor-pointer">
            Remember Me
          </label>
        </div>
        <button 
          type="button"
          onClick={() => toast.info('Contact system administrator for password recovery.')}
          className="text-xs font-semibold text-primary-600 dark:text-white/70 hover:text-primary-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
      <div className="pt-3 animate-in fade-in slide-in-from-bottom-6 duration-500 [animation-delay:400ms]">
        <button 
          type="submit" 
          disabled={loginMutation.isPending}
          className="w-full py-2.5 text-sm font-bold text-white bg-primary-500 hover:bg-primary-400 rounded-lg transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? 'Authenticating...' : 'Login'}
        </button>
      </div>
    </form>
  );
});

// --- REGISTER/SIGNUP FORM ---
export const RegisterForm = withSkeleton(({ onOtpRequired }: { onOtpRequired: (email: string) => void }) => {
  const form = useForm({
    defaultValues: { name: '', email: '', password: '', passwordConfirmation: '' }
  });
  
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data: any) => {
    if (data.password !== data.passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }
    registerMutation.mutate({ 
      name: data.name, 
      email: data.email, 
      password: data.password
    }, {
      onSuccess: () => {
        toast.success(`Verification OTP sent to ${data.email}`);
        onOtpRequired(data.email);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Registration failed')
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Name field */}
      <div className="space-y-1.5 animate-in fade-in slide-in-from-left-6 duration-500 [animation-delay:100ms]">
        <label htmlFor="name" className="text-sm font-semibold text-slate-800 dark:text-white/90 tracking-wide select-none ml-1">Full Name</label>
        <div className="relative flex items-center bg-slate-100/80 dark:bg-primary-950/45 border-2 border-slate-200 dark:border-primary-700/30 rounded-xl px-2 py-1 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white shrink-0 shadow-md">
            <User size={15} />
          </div>
          <input 
            id="name"
            type="text"
            {...form.register('name', { required: 'Name is required' })} 
            placeholder="John Doe"
            className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 focus:outline-none w-full px-3 text-sm placeholder-slate-400 dark:placeholder-white/35 font-medium"
          />
        </div>
      </div>

      {/* Email field */}
      <div className="space-y-1.5 animate-in fade-in slide-in-from-right-6 duration-500 [animation-delay:200ms]">
        <label htmlFor="reg-email" className="text-sm font-semibold text-slate-800 dark:text-white/90 tracking-wide select-none ml-1">Email Address</label>
        <div className="relative flex items-center bg-slate-100/80 dark:bg-primary-950/45 border-2 border-slate-200 dark:border-primary-700/30 rounded-xl px-2 py-1 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white shrink-0 shadow-md">
            <Mail size={15} />
          </div>
          <input 
            id="reg-email"
            type="email"
            {...form.register('email', { required: 'Email is required' })} 
            placeholder="name@example.com"
            className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 focus:outline-none w-full px-3 text-sm placeholder-slate-400 dark:placeholder-white/35 font-medium"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-1.5 animate-in fade-in slide-in-from-left-6 duration-500 [animation-delay:300ms]">
        <label htmlFor="reg-password" className="text-sm font-semibold text-slate-800 dark:text-white/90 tracking-wide select-none ml-1">Password</label>
        <div className="relative flex items-center bg-slate-100/80 dark:bg-primary-950/45 border-2 border-slate-200 dark:border-primary-700/30 rounded-xl px-2 py-1 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white shrink-0 shadow-md">
            <Lock size={15} />
          </div>
          <input 
            id="reg-password"
            type={showPassword ? "text" : "password"}
            {...form.register('password', { required: 'Password is required' })} 
            placeholder="••••••••"
            className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 focus:outline-none w-full px-3 text-sm placeholder-slate-400 dark:placeholder-white/35 font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 dark:text-white/60 hover:text-slate-600 dark:hover:text-white mr-2 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Confirm Password field */}
      <div className="space-y-1.5 animate-in fade-in slide-in-from-right-6 duration-500 [animation-delay:400ms]">
        <label htmlFor="reg-confirm" className="text-sm font-semibold text-slate-800 dark:text-white/90 tracking-wide select-none ml-1">Confirm Password</label>
        <div className="relative flex items-center bg-slate-100/80 dark:bg-primary-950/45 border-2 border-slate-200 dark:border-primary-700/30 rounded-xl px-2 py-1 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white shrink-0 shadow-md">
            <Lock size={15} />
          </div>
          <input 
            id="reg-confirm"
            type={showConfirmPassword ? "text" : "password"}
            {...form.register('passwordConfirmation', { required: 'Please confirm your password' })} 
            placeholder="••••••••"
            className="bg-transparent text-slate-900 dark:text-white border-0 focus:ring-0 focus:outline-none w-full px-3 text-sm placeholder-slate-400 dark:placeholder-white/35 font-medium"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-slate-400 dark:text-white/60 hover:text-slate-600 dark:hover:text-white mr-2 focus:outline-none transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3 animate-in fade-in slide-in-from-bottom-6 duration-500 [animation-delay:500ms]">
        <button 
          type="submit" 
          disabled={registerMutation.isPending}
          className="w-full py-2.5 text-sm font-bold text-white bg-primary-500 hover:bg-primary-400 rounded-lg transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {registerMutation.isPending ? 'Processing...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
});

// --- REGISTER OTP FORM ---
export const RegisterOtpForm = withSkeleton(({ email }: { email: string }) => {
  const form = useForm();
  const verifyOtpMutation = useVerifyRegisterOtp();
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    verifyOtpMutation.mutate({ email, otp: data.otp }, {
      onSuccess: (res) => {
        toast.success('Registration successful!');
        setAuth(res.data.user, res.data.accessToken);
        navigate('/store/dashboard', { replace: true });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Invalid OTP')
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-bold text-slate-800 dark:text-white/90 uppercase tracking-widest ml-1 cursor-pointer select-none">Secure Code</label>
        <p className="text-xs text-slate-500 dark:text-white/70 ml-1 mb-2">Sent to {email}</p>
        <Input 
          id="otp"
          type="text"
          icon={<KeyRound size={20} />}
          className="py-3.5 rounded-xl text-center text-lg tracking-widest font-bold bg-slate-100/80 dark:bg-primary-950/45 text-slate-900 dark:text-white border-slate-200 dark:border-primary-700/30"
          {...form.register('otp')} 
          placeholder="1234"
          maxLength={4}
        />
      </div>
      <Button type="submit" isLoading={verifyOtpMutation.isPending} loadingText="Verifying" className="w-full mt-2">
        <span>Verify OTP & Complete</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
});
