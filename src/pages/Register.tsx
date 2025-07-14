import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== repeat) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="w-full mb-4 px-4 py-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full mb-4 px-4 py-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} required />
          <input type="password" placeholder="Repetir contraseña" className="w-full mb-6 px-4 py-2 border rounded" value={repeat} onChange={e => setRepeat(e.target.value)} required />
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded font-semibold" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">¿Ya tienes cuenta?</p>
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-semibold mt-2">
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};
export default Register; 