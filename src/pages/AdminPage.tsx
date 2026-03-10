import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { sendN8NWebhook } from "../lib/webhooks"
import { Input } from "../components/ui/input"
import { Mail, UserPlus, Sparkles } from "lucide-react"
import { Tooltip } from "../components/ui/Tooltip"
import { useToast } from "../context/ToastContext"

export default function AdminPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviting, setInviting] = useState(false)

    const handleSpecialInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail) return

        setInviting(true)
        try {
            // Send special invitation webhook directly (waitlist is no longer needed)
            const success = await sendN8NWebhook("special_invitation", {
                email: inviteEmail,
                fullName: inviteEmail.split('@')[0] // Fallback full name
            })

            if (success) {
                setInviteEmail("")
                toast.success("Invitación especial enviada con éxito")
            } else {
                throw new Error("Error al enviar el webhook")
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Error al enviar la invitación")
        } finally {
            setInviting(false)
        }
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
                            <p className="text-gray-500">Gestión de invitaciones y herramientas del sistema</p>
                        </div>
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
                                <p className="text-sm text-gray-500">Envía un correo personalizado a un nuevo usuario para invitarlo a Linka.</p>
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

                <Card className="bg-white/50 border-dashed border-2 border-gray-100 shadow-none">
                    <CardContent className="p-12 text-center space-y-3">
                        <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-full mb-2">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Registro Abierto Activado</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            La gestión de lista de espera ha sido deshabilitada. Ahora cualquier usuario puede registrarse directamente desde la página de inicio.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
