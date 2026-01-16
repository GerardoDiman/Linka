import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff, Check } from "lucide-react"
import { useToast } from "../context/ToastContext"

export default function RegisterPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const passwordRequirements = useMemo(() => [
        { label: "Mínimo 10 caracteres", met: password.length >= 10 },
        { label: "Una letra mayúscula", met: /[A-Z]/.test(password) },
        { label: "Una letra minúscula", met: /[a-z]/.test(password) },
        { label: "Un número", met: /[0-9]/.test(password) },
        { label: "Un carácter especial (@$!%*?&)", met: /[@$!%*?&]/.test(password) },
    ], [password])

    const isPasswordValid = passwordRequirements.every(req => req.met)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            setLoading(false)
            return
        }

        try {
            const normalizedEmail = email.toLowerCase().trim()

            // 1. Verificar si el email está en la lista de espera y aprobado mediante RPC seguro
            const { data: status, error: rpcError } = await supabase
                .rpc('check_waitlist_status', { email_to_check: normalizedEmail })

            if (rpcError) {
                setError("Ocurrió un error técnico al verificar tu acceso. Por favor contacta a soporte.")
                setLoading(false)
                return
            }

            if (!status) {
                setError("Este correo no ha solicitado acceso o no se encuentra en la lista de espera.")
                setLoading(false)
                return
            }

            if (status !== 'approved') {
                setError("Tu solicitud de acceso aún no ha sido aprobada. Te avisaremos por correo.")
                setLoading(false)
                return
            }

            // 2. Proceder con el registro si está aprobado
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username,
                        has_seen_onboarding: false,
                    }
                }
            })

            if (signUpError) throw signUpError

            toast.success("¡Registro exitoso! Por favor revisa tu email para confirmar tu cuenta.")
            navigate("/login")
        } catch (err: any) {
            setError(err.message || "Error al registrarse")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title="Crea tu cuenta" subtitle="Comienza a visualizar tus datos hoy">
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Nombre Completo
                                </label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    required
                                    placeholder="Juan Pérez"
                                    className="mt-1"
                                    value={fullName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Usuario
                                </label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    placeholder="juanp"
                                    className="mt-1"
                                    value={username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="tu@email.com"
                                className="mt-1"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="pr-10"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Requirements Checklist */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        {req.met ? (
                                            <Check size={14} className="text-green-500" />
                                        ) : (
                                            <div className="h-1 w-1 rounded-full bg-gray-300 ml-1.5 mr-1" />
                                        )}
                                        <span className={`text-[11px] ${req.met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                Confirmar Contraseña
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="pr-10"
                                    value={confirmPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
                            {loading ? "Creando cuenta..." : "Registrarse"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-500">¿Ya tienes cuenta? </span>
                            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                                Inicia Sesión
                            </Link>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                            <span className="text-gray-500 text-xs">¿Aún no tienes acceso? </span>
                            <Link to="/#access" className="text-xs font-medium text-primary hover:text-primary/80">
                                Solicitar Acceso
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
