import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import LoginPage from './component/login';
import RegisterPage from './component/register';
import SetPassword from './component/SetPassword';
import DashboardPage from './component/dashboard';
import PelangganPage from './component/pelanggan';
import PenggunaanAirPage from './component/penggunaanair';
import TransaksiPage from './component/transaksi';
import KelompokPage from './component/kelompok';
import TarifPage from './component/tarif';
import NotifikasiForm from './component/notifikasi';
import VerifyAdminEmail from './component/VerifyAdminEmail';
import AppLayout from './component/AppLayout';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { NotificationProvider } from './utils/NotificationContext';
import { initializeCsrfToken } from './utils/axiosConfig';
import ForgotPasswordAdmin from './component/ForgotPasswordAdmin';
import ResetPasswordAdmin from './component/ResetPasswordAdmin';
import InviteAdmin from './component/inviteAdmin';
import AcceptInvitation from './component/AcceptInvitation';
import pamTheme from './theme/pamTheme';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth, userData } = useAuth();
  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Jika role tidak diizinkan, redirect ke /penggunaanair
    return <Navigate to="/penggunaanair" replace />;
  }
  return children;
};

const LayoutWithSidebarAndTopbar = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const AppRoutes = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  return (
    <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/" element={isLoadingAuth ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box> : (isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />)} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/verify-admin-email" element={<VerifyAdminEmail />} />
          <Route path="/forgot-password-admin" element={<ForgotPasswordAdmin />} />
          <Route path="/reset-admin-password" element={<ResetPasswordAdmin />} />
          <Route path="/admin/accept-invitation" element={<AcceptInvitation />} />
          
          {/* Protected Routes */}


          <Route
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <LayoutWithSidebarAndTopbar />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pelanggan" element={<PelangganPage />} />
            <Route path="/penggunaanair" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <PenggunaanAirPage />
                </ProtectedRoute>
            } />
            <Route path="/transaksi" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <TransaksiPage />
                </ProtectedRoute>
            } />
            <Route path="/kelompok" element={<KelompokPage />} />
            <Route path="/tarif" element={<TarifPage />} />
            <Route path="/notifikasi" element={<NotifikasiForm />
            } />
            <Route path="/invite-admin" element={<InviteAdmin />} />
          </Route>
          <Route path="*" element={isLoadingAuth ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box> : (<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />)} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    const initializeApp = async () => {
        try {
            await initializeCsrfToken();
        } catch (error) {
            // CSRF token initialization failed
        }
    };
    initializeApp();
  }, []);

  return (
    <ThemeProvider theme={pamTheme}>
      <CssBaseline />
        <Router>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
        </Router>
    </ThemeProvider>
  );
}
export default App;
