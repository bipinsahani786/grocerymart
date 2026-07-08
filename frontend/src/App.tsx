import { Suspense, lazy, useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'sonner';
import { PageLoadingSkeleton } from './components/ui/PageLoadingSkeleton';
import { AppLayout } from './components/layout/AppLayout';


const Login = lazy(() => import('@/features/auth/pages/LoginPage'));
const SuperadminDashboard = lazy(() => import('@/features/superadmin/dashboard/pages/SuperadminDashboardPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperadminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isSuperadmin = user?.userType === 'admin';
  if (!isSuperadmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Color palettes
const colorPalettes = {
  orange: {
    '--primary-50': '#fff7ed', '--primary-100': '#ffedd5', '--primary-200': '#fed7aa', '--primary-300': '#fdba74', '--primary-400': '#fb923c', '--primary-500': '#f97316', '--primary-600': '#ea580c', '--primary-700': '#c2410c', '--primary-800': '#9a3412', '--primary-900': '#7c2d12', '--primary-950': '#431407',
  },
  blue: {
    '--primary-50': '#eff6ff', '--primary-100': '#dbeafe', '--primary-200': '#bfdbfe', '--primary-300': '#93c5fd', '--primary-400': '#60a5fa', '--primary-500': '#3b82f6', '--primary-600': '#2563eb', '--primary-700': '#1d4ed8', '--primary-800': '#1e40af', '--primary-900': '#1e3a8a', '--primary-950': '#172554',
  },
  green: {
    '--primary-50': '#ecfdf5', '--primary-100': '#d1fae5', '--primary-200': '#a7f3d0', '--primary-300': '#6ee7b7', '--primary-400': '#34d399', '--primary-500': '#10b981', '--primary-600': '#059669', '--primary-700': '#047857', '--primary-800': '#065f46', '--primary-900': '#064e3b', '--primary-950': '#022c22',
  },
  purple: {
    '--primary-50': '#f5f3ff', '--primary-100': '#ede9fe', '--primary-200': '#ddd6fe', '--primary-300': '#c4b5fd', '--primary-400': '#a78bfa', '--primary-500': '#8b5cf6', '--primary-600': '#7c3aed', '--primary-700': '#6d28d9', '--primary-800': '#5b21b6', '--primary-900': '#4c1d95', '--primary-950': '#2e1065',
  },
  rose: {
    '--primary-50': '#fff1f2', '--primary-100': '#ffe4e6', '--primary-200': '#fecdd3', '--primary-300': '#fda4af', '--primary-400': '#fb7185', '--primary-500': '#f43f5e', '--primary-600': '#e11d48', '--primary-700': '#be123c', '--primary-800': '#9f1239', '--primary-900': '#881337', '--primary-950': '#4c0519',
  },
  slate: {
    '--primary-50': '#f8fafc', '--primary-100': '#f1f5f9', '--primary-200': '#e2e8f0', '--primary-300': '#cbd5e1', '--primary-400': '#94a3b8', '--primary-500': '#64748b', '--primary-600': '#475569', '--primary-700': '#334155', '--primary-800': '#1e293b', '--primary-900': '#0f172a', '--primary-950': '#020617',
  },
  teal: {
    '--primary-50': '#f0fdfa', '--primary-100': '#ccfbf1', '--primary-200': '#99f6e4', '--primary-300': '#5eead4', '--primary-400': '#2dd4bf', '--primary-500': '#14b8a6', '--primary-600': '#0d9488', '--primary-700': '#0f766e', '--primary-800': '#115e59', '--primary-900': '#134e4a', '--primary-950': '#042f2e',
  },
  red: {
    '--primary-50': '#fef2f2', '--primary-100': '#fee2e2', '--primary-200': '#fecaca', '--primary-300': '#fca5a5', '--primary-400': '#f87171', '--primary-500': '#ef4444', '--primary-600': '#dc2626', '--primary-700': '#b91c1c', '--primary-800': '#991b1b', '--primary-900': '#7f1d1d', '--primary-950': '#450a0a',
  }
};

const fontFamilies = {
  inter: { '--font-primary': '"Inter", sans-serif', '--font-heading': '"Outfit", sans-serif' },
  roboto: { '--font-primary': '"Roboto", sans-serif', '--font-heading': '"Roboto Condensed", sans-serif' },
  poppins: { '--font-primary': '"Lato", sans-serif', '--font-heading': '"Poppins", sans-serif' },
  jakarta: { '--font-primary': '"Plus Jakarta Sans", sans-serif', '--font-heading': '"Plus Jakarta Sans", sans-serif' },
  dmsans: { '--font-primary': '"DM Sans", sans-serif', '--font-heading': '"Outfit", sans-serif' },
  nunito: { '--font-primary': '"Nunito", sans-serif', '--font-heading': '"Nunito", sans-serif' },
  lato: { '--font-primary': '"Lato", sans-serif', '--font-heading': '"Lato", sans-serif' },
  rubik: { '--font-primary': '"Rubik", sans-serif', '--font-heading': '"Rubik", sans-serif' },
  cinzel: { '--font-primary': '"Inter", sans-serif', '--font-heading': '"Cinzel", serif' },
  montserrat: { '--font-primary': '"Montserrat", sans-serif', '--font-heading': '"Montserrat", sans-serif' },
};

function App() {
  const { theme, primaryColor, fontFamily } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    // Handle theme class
    root.classList.remove('light', 'dark', 'semi-dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }

    // Inject color palette
    const colors = colorPalettes[primaryColor];
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }

    // Inject fonts
    const fonts = fontFamilies[fontFamily];
    for (const [key, value] of Object.entries(fonts)) {
      root.style.setProperty(key, value);
    }
  }, [theme, primaryColor, fontFamily]);

  return (
    <>
      <Toaster theme={theme === 'light' ? 'light' : 'dark'} position="top-right" richColors />
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Superadmin Routes (made default for Dashboard) */}
            <Route path="/dashboard" element={<SuperadminRoute><SuperadminDashboard /></SuperadminRoute>} />
            <Route path="/superadmin/dashboard" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
