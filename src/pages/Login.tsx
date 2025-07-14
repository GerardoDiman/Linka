import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="w-full mb-4 px-4 py-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full mb-6 px-4 py-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">¿No tienes cuenta?</p>
          <button onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-800 font-semibold mt-2">
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login; 