import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotionVisualizer from '../components/NotionVisualizer';


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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Contenido principal - Visualizador de Notion con navegación integrada */}
      <div className="flex-1">
        <NotionVisualizer 
          user={user ? { email: user.email, name: user.name, role: user.role } : undefined} 
          onLogout={handleLogout} 
        />
      </div>
    </div>
  );
};

export default Dashboard; 