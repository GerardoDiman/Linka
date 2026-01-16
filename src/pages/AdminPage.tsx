import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Loader2, Check, X, ArrowLeft, Users, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { sendN8NWebhook } from "../lib/webhooks"
import { Input } from "../components/ui/input"
import { Mail, UserPlus, Sparkles } from "lucide-react"
import { Tooltip } from "../components/ui/Tooltip"
import { useToast } from "../context/ToastContext"

interface WaitlistEntry {
    id: string
    email: string
    status: 'pending' | 'approved' | 'rejected'
    comments?: string
    created_at: string
}

export default function AdminPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [entries, setEntries] = useState<WaitlistEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviting, setInviting] = useState(false)

    const fetchEntries = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('waitlist')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setEntries(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchEntries()
    }, [])

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
        setActionLoading(id)

        const entry = entries.find(e => e.id === id)

        const { error } = await supabase
            .from('waitlist')
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            setEntries(entries.map(e => e.id === id ? { ...e, status: newStatus } : e))

            // Trigger webhook if approved or rejected
            if ((newStatus === 'approved' || newStatus === 'rejected') && entry) {
                const actionMapping = {
                    approved: 'user_approval',
                    rejected: 'user_rejected'
                } as const;

                const success = await sendN8NWebhook(actionMapping[newStatus], {
                    email: entry.email,
                    comments: entry.comments
                })

                if (success) {
                    const actionLabel = newStatus === 'approved' ? 'aprobación' : 'rechazo';
                    toast.success(`Webhook de ${actionLabel} enviado para: ${entry.email}`)
                } else {
                    const actionLabel = newStatus === 'approved' ? 'aprobación' : 'rechazo';
                    toast.error(`Error al enviar webhook de ${actionLabel}. Revisa la consola y los logs de Supabase.`)
                }
            }
        } else {
            console.error("[Admin] Error updating status in Supabase:", error)
            toast.error(`Error al actualizar el estado: ${error.message}`)
        }
        setActionLoading(null)
    }

    const handleSpecialInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail) return

        setInviting(true)
        try {
            // First add to waitlist as approved
            const { error: dbError } = await supabase
                .from('waitlist')
                .insert([{
                    email: inviteEmail,
                    status: 'approved',
                    comments: 'Special Admin Invitation'
                }])

            if (dbError) throw dbError

            // Send special invitation webhook
            await sendN8NWebhook("special_invitation", {
                email: inviteEmail
            })

            setInviteEmail("")
            fetchEntries()
            toast.success("Invitación especial enviada con éxito")
        } catch (err: any) {
            toast.error(err.message || "Error al enviar la invitación")
        } finally {
            setInviting(false)
        }
    }

    const stats = {
        total: entries.length,
        pending: entries.filter(e => e.status === 'pending').length,
        approved: entries.filter(e => e.status === 'approved').length,
        rejected: entries.filter(e => e.status === 'rejected').length,
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Tooltip content="Volver al Dashboard" position="right">
                            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
                                <ArrowLeft size={20} />
                            </Button>
                        </Tooltip>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                            <p className="text-gray-500">Gestiona las solicitudes de acceso a Linka</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={fetchEntries} variant="outline" size="sm" disabled={loading} className="rounded-xl h-10 px-4">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
                        </Button>
                    </div>
                </div>

                {/* Special Invitation Card */}
                <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/10 shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles size={18} />
                                    <h3 className="font-bold">Invitación Especial</h3>
                                </div>
                                <p className="text-sm text-gray-500">Envía acceso directo y un correo personalizado a un nuevo usuario.</p>
                            </div>
                            <form onSubmit={handleSpecialInvite} className="flex w-full md:w-auto items-center gap-2">
                                <div className="relative flex-1 md:w-80">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="pl-10 h-11 bg-white border-primary/20 focus:ring-primary/20 rounded-xl"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={inviting} className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 transition-all font-bold">
                                    {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus size={18} className="mr-2" /> Invitar</>}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border-none shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Aprobados</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Rechazados</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white border-none shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-gray-50">
                        <CardTitle>Solicitudes de Acceso</CardTitle>
                        <CardDescription>Lista de correos que han solicitado unirse a la plataforma</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Email</th>
                                        <th className="px-6 py-4 font-semibold">Comentarios</th>
                                        <th className="px-6 py-4 font-semibold">Fecha</th>
                                        <th className="px-6 py-4 font-semibold">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {entries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{entry.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={entry.comments}>
                                                {entry.comments || <span className="text-gray-300 italic">Sin comentarios</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        entry.status === 'approved' ? 'success' :
                                                            entry.status === 'rejected' ? 'destructive' :
                                                                'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {entry.status === 'approved' ? 'Aprobado' :
                                                        entry.status === 'rejected' ? 'Rechazado' :
                                                            'Pendiente'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {entry.status === 'pending' && (
                                                    <>
                                                        <Tooltip content="Aprobar solicitud">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-green-600 border-green-100 hover:bg-green-50 hover:text-green-700"
                                                                onClick={() => handleStatusUpdate(entry.id, 'approved')}
                                                                disabled={!!actionLoading}
                                                            >
                                                                {actionLoading === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={14} className="mr-1" />}
                                                                Aprobar
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip content="Rechazar solicitud">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => handleStatusUpdate(entry.id, 'rejected')}
                                                                disabled={!!actionLoading}
                                                            >
                                                                {actionLoading === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X size={14} className="mr-1" />}
                                                                Rechazar
                                                            </Button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {entry.status !== 'pending' && (
                                                    <Tooltip content="Restablecer a pendiente">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 text-gray-400 hover:text-gray-600"
                                                            onClick={() => handleStatusUpdate(entry.id, 'pending')}
                                                            disabled={!!actionLoading}
                                                        >
                                                            Restablecer
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {entries.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                                                No hay solicitudes registradas
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
