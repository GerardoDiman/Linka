import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Clock, XCircle, Crown, LogOut, RefreshCw, Edit3, MessageSquare, Mail, Plus } from 'lucide-react';
import { apiFetch } from '../services/api';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'pending' | 'approved' | 'rejected' | 'admin';
  createdAt: string;
  leadId?: string;
  company?: string;
  roleTitle?: string;
  description?: string;
  source?: string;
  notes?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  admin: number;
}

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, admin: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [creatingInvitation, setCreatingInvitation] = useState(false);

  // Verificar que el usuario sea admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
    fetchSyncStats();
  }, []);

  const fetchSyncStats = async () => {
    try {
      const response = await apiFetch('/sync/stats');
      setSyncStats(response.stats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas de sincronización:', error);
    }
  };

  const handleSyncNotion = async () => {
    setSyncing(true);
    try {
      await apiFetch('/sync/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      toast.success('Sincronización completada');
      await fetchUsers(); // Recargar usuarios
      await fetchSyncStats(); // Recargar estadísticas
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      toast.error('Error en sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/auth/get-all-users');
      setUsers(response.users);
      setStats(response.stats);
      console.log('✅ Usuarios cargados:', response.users.length);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, notes?: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate?.leadId) {
      toast.error('No se puede actualizar este usuario');
      return;
    }

    setUpdating(userId);
    
    try {
      const response = await apiFetch('/auth/update-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: userToUpdate.leadId,
          newStatus: newRole,
          adminNotes: notes
        }),
      });

      // Actualizar la lista de usuarios
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole as any, notes: notes || u.notes } : u
      ));

      // Recalcular estadísticas
      const newStats = {
        total: users.length,
        pending: users.filter(u => u.role === 'pending').length + (newRole === 'pending' ? 1 : 0) - (userToUpdate.role === 'pending' ? 1 : 0),
        approved: users.filter(u => u.role === 'approved').length + (newRole === 'approved' ? 1 : 0) - (userToUpdate.role === 'approved' ? 1 : 0),
        rejected: users.filter(u => u.role === 'rejected').length + (newRole === 'rejected' ? 1 : 0) - (userToUpdate.role === 'rejected' ? 1 : 0),
        admin: users.filter(u => u.role === 'admin').length + (newRole === 'admin' ? 1 : 0) - (userToUpdate.role === 'admin' ? 1 : 0)
      };
      setStats(newStats);

      toast.success(`Usuario ${userToUpdate.name} actualizado a ${newRole}`);
      console.log('✅ Usuario actualizado:', response);
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      toast.error('Error actualizando usuario');
    } finally {
      setUpdating(null);
      setShowNotesModal(false);
      setAdminNotes('');
      setSelectedUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error en logout:', error);
      navigate('/');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'admin':
        return <Crown className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const openNotesModal = (user: User) => {
    setSelectedUser(user);
    setShowNotesModal(true);
  };

  const handleCreateInvitation = async () => {
    if (!invitationEmail.trim()) {
      toast.error('Por favor ingresa un email');
      return;
    }

    setCreatingInvitation(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await apiFetch('/invitations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'X-Auth-Token': token } : {}),
        },
        body: JSON.stringify({ email: invitationEmail, ...(token ? { token } : {}) })
      });

      toast.success('Invitación creada exitosamente');
      setShowInvitationModal(false);
      setInvitationEmail('');
      
      // El webhook se enviará automáticamente desde el servidor
      console.log('✅ Invitación creada:', response.invitation);
    } catch (error) {
      console.error('❌ Error creando invitación:', error);
      toast.error('Error creando invitación');
    } finally {
      setCreatingInvitation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInvitationModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Crear Invitación
              </button>
              <button
                onClick={handleSyncNotion}
                disabled={syncing}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Notion'}
              </button>
              <button
                onClick={fetchUsers}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Gestión de Usuarios
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Administra los roles y estados de los usuarios desde Notion
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Información
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        <div><strong>Empresa:</strong> {user.company || 'No especificada'}</div>
                        <div><strong>Rol:</strong> {user.roleTitle || 'No especificado'}</div>
                        <div><strong>Fuente:</strong> {user.source || 'Landing Page'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => {
                            if (e.target.value !== user.role) {
                              if (e.target.value === 'rejected') {
                                openNotesModal(user);
                              } else {
                                handleRoleChange(user.id, e.target.value);
                              }
                            }
                          }}
                          disabled={updating === user.id}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobado</option>
                          <option value="rejected">Rechazado</option>
                          <option value="admin">Administrador</option>
                        </select>
                        {user.notes && (
                          <button
                            onClick={() => openNotesModal(user)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Ver notas"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {updating === user.id && (
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          Actualizando...
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aprobados</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rechazados</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Administradores</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.admin}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para notas */}
      {showNotesModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Notas para {selectedUser.name}
              </h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Agrega notas sobre la decisión..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setAdminNotes('');
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRoleChange(selectedUser.id, 'rejected', adminNotes)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear invitación */}
      {showInvitationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Crear Nueva Invitación
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email del invitado
                </label>
                <input
                  type="email"
                  value={invitationEmail}
                  onChange={(e) => setInvitationEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowInvitationModal(false);
                    setInvitationEmail('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateInvitation}
                  disabled={creatingInvitation}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {creatingInvitation ? 'Creando...' : 'Crear Invitación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 