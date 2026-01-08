import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            navigate("/dashboard")
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title="Bienvenido de nuevo" subtitle="Ingresa a tu cuenta para continuar">
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                                {error}
                            </div>
                        )}
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
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <Link to="/recovery" className="text-sm font-medium text-primary hover:text-primary/80">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
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
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Iniciando..." : "Iniciar Sesión"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-500">¿No tienes cuenta? </span>
                            <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                                Regístrate
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
