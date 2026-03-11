import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Loader2, ArrowLeft, Users, UserCheck, Shield, Clock, TrendingUp, Search, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Tooltip } from "../components/ui/Tooltip"
import { useToast } from "../context/ToastContext"
import { motion } from "framer-motion"

interface AdminStats {
    total_users: number
    free_users: number
    pro_users: number
    active_24h: number
    new_7d: number
}

interface UserProfile {
    id: string
    email: string
    full_name: string
    username: string
    role: string
    plan_type: string
    last_active_at: string
    updated_at: string
    created_at?: string
}

export default function AdminPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<UserProfile[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true)
                
                // Fetch stats via RPC
                const { data: statsData, error: statsError } = await supabase.rpc('get_platform_stats')
                if (statsError) throw statsError

                if (statsData && statsData.error === 'Unauthorized') {
                    throw new Error("No tienes permisos de administrador para ver estas métricas.")
                }

                setStats(statsData)

                // Fetch users list
                const { data: usersData, error: usersError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('last_active_at', { ascending: false })
                
                if (usersError) throw usersError
                setUsers(usersData || [])

            } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Error al cargar datos de administración")
            } finally {
                setLoading(false)
            }
        }

        fetchAdminData()
    }, [])

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A"
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-gray-500 font-medium">Cargando panel de control...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Tooltip content="Volver al Dashboard" position="right">
                            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full bg-white shadow-sm hover:shadow-md transition-all">
                                <ArrowLeft size={20} />
                            </Button>
                        </Tooltip>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-500 font-medium">Visualización de crecimiento y actividad de Linka</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: "Total Usuarios", value: stats?.total_users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Usuarios Pro", value: stats?.pro_users, icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Usuarios Free", value: stats?.free_users, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Activos (24h)", value: stats?.active_24h, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Nuevos (7d)", value: stats?.new_7d, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" }
                    ].map((stat, i) => (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                <CardContent className="p-5 flex flex-col gap-3">
                                    <div className={`p-2 w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stat.value || 0}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Users Table Card */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Users size={20} className="text-primary" />
                                Todos los Usuarios
                            </CardTitle>
                            <p className="text-sm text-gray-400 font-medium">Lista detallada de usuarios registrados</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por email o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.1em] border-b border-gray-50">
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Suscripción</th>
                                        <th className="px-6 py-4">Última Actividad</th>
                                        <th className="px-6 py-4">Registro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                                                        {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{user.full_name || "Sin nombre"}</p>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium tracking-tight">
                                                            <Mail size={12} className="opacity-70" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        user.plan_type === 'pro' 
                                                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}>
                                                        {user.plan_type || 'FREE'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                        <Clock size={12} className="text-primary/70" />
                                                        {formatDate(user.last_active_at)}
                                                    </div>
                                                    {user.last_active_at && (
                                                        <p className="text-[10px] text-gray-400 font-medium">Hacer un momento</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-gray-500">{formatDate(user.created_at || user.updated_at)}</p>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <p className="text-gray-400 font-medium">No se encontraron usuarios</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
