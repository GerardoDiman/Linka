import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff, Check } from "lucide-react"

export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const passwordRequirements = useMemo(() => [
        { label: "Mínimo 10 caracteres", met: password.length >= 10 },
        { label: "Una letra mayúscula", met: /[A-Z]/.test(password) },
        { label: "Una letra minúscula", met: /[a-z]/.test(password) },
        { label: "Un número", met: /[0-9]/.test(password) },
        { label: "Un carácter especial (@$!%*?&)", met: /[@$!%*?&]/.test(password) },
    ], [password])

    const isPasswordValid = passwordRequirements.every(req => req.met)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!isPasswordValid) {
            setError("La contraseña no cumple con todos los requisitos")
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                navigate("/login")
            }, 3000)
        } catch (err: any) {
            setError(err.message || "Error al restablecer la contraseña")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title="Nueva Contraseña" subtitle="Crea una contraseña segura para tu cuenta">
            <Card>
                <CardContent className="pt-6">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg">
                                ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Nueva Contraseña
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
                                    Confirmar Nueva Contraseña
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
                                {loading ? "Actualizando..." : "Restablecer Contraseña"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
