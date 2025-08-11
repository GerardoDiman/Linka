import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import * as authService from '../services/auth';

const Login = () => {
  const { login, checkUserStatus } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    setError('');
    try {
      const result = await apiFetch('/test');
      console.log('✅ API Test successful:', result);
      setError('✅ API funcionando correctamente');
    } catch (err: any) {
      console.error('❌ API Test failed:', err);
      setError(`❌ Error de API: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const checkStatus = async () => {
    if (!email) {
      setError('Por favor ingresa tu email para verificar el estado');
      return;
    }

    setCheckingStatus(true);
    setError('');
    
    try {
      const user = await checkUserStatus(email);
      if (user) {
        if (user.role === 'approved' || user.role === 'admin') {
          setError('✅ Tu cuenta está aprobada. Puedes iniciar sesión.');
        } else if (user.role === 'pending') {
          setError('⏳ Tu solicitud está en revisión. Te contactaremos pronto.');
        } else if (user.role === 'rejected') {
          setError('❌ Tu solicitud no fue aprobada. Contacta con soporte si tienes preguntas.');
        }
      } else {
        setError('❓ No encontramos una solicitud con este email. ¿Ya enviaste tu solicitud?');
      }
    } catch (err: any) {
      console.error('❌ Error verificando estado:', err);
      setError('Error verificando estado. Intenta de nuevo.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('🔄 Intentando login con:', { email });
      
      // Intentar login (puede ser con o sin password)
      const response = await authService.login(email, password);
      
      // Verificar si requiere configuración de contraseña
      if (response && response.requiresPasswordSetup) {
        console.log('🔧 Usuario requiere configuración de contraseña');
        navigate(`/setup-password?email=${encodeURIComponent(email)}`);
        return;
      }
      
      // Si no requiere configuración, usar el contexto de auth
      await login(email, password);
      
      console.log('✅ Login exitoso, navegando a dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Iniciar sesión</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Accede a tu cuenta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="tu@email.com" 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña <span className="text-gray-500 text-xs">(opcional para primer acceso)</span>
            </label>
            <input 
              id="password"
              type="password" 
              placeholder="•••••••• (dejar vacío si es tu primer acceso)" 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">¿No tienes cuenta?</p>
          <button 
            onClick={() => navigate('/register')} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold mt-2 transition-colors"
          >
            Crear cuenta
          </button>
        </div>

        {/* Verificar estado de solicitud */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ¿Ya enviaste tu solicitud?
            </p>
            <button
              onClick={checkStatus}
              disabled={checkingStatus || !email}
              className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingStatus ? 'Verificando...' : 'Verificar estado de mi solicitud'}
            </button>
          </div>
        </div>
        
        {/* Test API Button - Solo para debugging */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={testAPI}
            disabled={testing}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {testing ? 'Probando API...' : '🔧 Probar conexión API'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 