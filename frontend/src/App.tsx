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
    '--primary-50': '#fff8eb', '--primary-100': '#ffedc6', '--primary-200': '#ffd889', '--primary-300': '#ffbd4a', '--primary-400': '#f59e0b', '--primary-500': '#d97706', '--primary-600': '#b45309', '--primary-700': '#92400e', '--primary-800': '#78350f', '--primary-900': '#5f2d10', '--primary-950': '#341605',
  },
  blue: {
    '--primary-50': '#f0f9ff', '--primary-100': '#e0f2fe', '--primary-200': '#bae6fd', '--primary-300': '#7dd3fc', '--primary-400': '#4d908e', '--primary-500': '#277da1', '--primary-600': '#1f6481', '--primary-700': '#174c62', '--primary-800': '#0f3342', '--primary-900': '#081a21', '--primary-950': '#040d11',
  },
  green: {
    '--primary-50': '#f0fdf4', '--primary-100': '#dcfce7', '--primary-200': '#bbf7d0', '--primary-300': '#86efac', '--primary-400': '#43aa8b', '--primary-500': '#90be6d', '--primary-600': '#7ba759', '--primary-700': '#658f46', '--primary-800': '#507833', '--primary-900': '#3b6020', '--primary-950': '#25490c',
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

    // Inject color palette matching active theme's "Mart" highlight
    const resolvedColor = (theme === 'dark' || theme === 'semi-dark') ? 'green' : 'blue';
    const colors = colorPalettes[resolvedColor];
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
