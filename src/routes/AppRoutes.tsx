import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Pricing from '../pages/Pricing';
import Account from '../pages/Account';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth() as any;
  return user ? children : <Navigate to="/login" replace />;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes; 