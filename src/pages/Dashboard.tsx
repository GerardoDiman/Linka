import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotionVisualizer from '../components/NotionVisualizer';
import React from 'react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('🔄 Intentando logout...');
      await logout();
      console.log('✅ Logout exitoso, navegando a login');
      navigate('/login');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún así navegar al login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Contenido principal - Visualizador de Notion */}
      <div className="flex-1">
        <NotionVisualizer user={user} onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Dashboard; 