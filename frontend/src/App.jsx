import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout/Layout';

import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import LeadList from './pages/Leads/LeadList';
import LeadForm from './pages/Leads/LeadForm';
import LeadDetail from './pages/Leads/LeadDetail';
import LeadUpload from './pages/Leads/LeadUpload';
import ActivityList from './pages/Activities/ActivityList';
import Pipeline from './pages/Pipeline/Pipeline';
import PolicyList from './pages/Policies/PolicyList';
import PolicyForm from './pages/Policies/PolicyForm';
import NotificationList from './pages/Notifications/NotificationList';
import Settings from './pages/Settings/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

const ProtectedRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route element={<ProtectedRoute><NotificationProvider><Layout /></NotificationProvider></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<LeadList />} />
        <Route path="/leads/new" element={<LeadForm />} />
        <Route path="/leads/upload" element={<LeadUpload />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/leads/:id/edit" element={<LeadForm />} />
        <Route path="/activities" element={<ActivityList />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/policies" element={<PolicyList />} />
        <Route path="/policies/new" element={<PolicyForm />} />
        <Route path="/notifications" element={<NotificationList />} />
        <Route path="/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover theme="light" style={{ fontSize: '13px' }} />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
