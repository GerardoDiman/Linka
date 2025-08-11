import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Pricing from '../pages/Pricing';
import Account from '../pages/Account';
import InterestForm from '../pages/InterestForm';
import PendingAccess from '../pages/PendingAccess';
import Admin from '../pages/Admin';
import WebhookTest from '../pages/WebhookTest';
import SetupPassword from '../pages/SetupPassword';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, hasAccess } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/pending" replace />;
  }
  
  return children;
}

function PendingRoute({ children }: { children: React.ReactElement }) {
  const { user, hasAccess } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AdminRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/setup-password" element={<SetupPassword />} />
      <Route path="/interest" element={<InterestForm />} />
      <Route path="/pending" element={<PendingRoute><PendingAccess /></PendingRoute>} />
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/webhook-test" element={<WebhookTest />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes; 