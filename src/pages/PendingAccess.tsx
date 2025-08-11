
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, LogOut, CheckCircle, XCircle } from 'lucide-react';

const PendingAccess = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error en logout:', error);
      navigate('/');
    }
  };

  const getStatusMessage = () => {
    switch (user?.role) {
      case 'pending':
        return {
          title: 'Tu solicitud está en revisión',
          message: 'Hemos recibido tu solicitud y la estamos evaluando. Te contactaremos pronto para programar una entrevista.',
          icon: <Clock className="w-12 h-12 text-yellow-500" />,
          color: 'yellow'
        };
      case 'rejected':
        return {
          title: 'Solicitud no aprobada',
          message: 'Gracias por tu interés en Linka v2.0. Después de revisar tu solicitud, no podemos ofrecerte acceso en este momento.',
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          color: 'red'
        };
      default:
        return {
          title: 'Estado desconocido',
          message: 'No pudimos determinar el estado de tu solicitud.',
          icon: <Clock className="w-12 h-12 text-gray-500" />,
          color: 'gray'
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {status.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {status.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {status.message}
          </p>
        </div>

        {user?.role === 'pending' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Próximos pasos
                </h3>
                <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                  <li>• Revisaremos tu solicitud en los próximos días</li>
                  <li>• Te contactaremos por email para programar una entrevista</li>
                  <li>• La entrevista será breve y nos ayudará a entender mejor tu caso de uso</li>
                  <li>• Después de la entrevista, recibirás una respuesta final</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'rejected' && (
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ¿Qué puedes hacer?
                </h3>
                <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
                  <li>• Explorar el modo demo de la aplicación</li>
                  <li>• Revisar nuestra documentación y guías</li>
                  <li>• Contactarnos si tienes preguntas específicas</li>
                  <li>• Volver a aplicar en el futuro si tu caso de uso cambia</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Volver al Inicio
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿Tienes preguntas? Contacta con nuestro equipo en{' '}
            <a href="mailto:soporte@linka.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              soporte@linka.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingAccess; 