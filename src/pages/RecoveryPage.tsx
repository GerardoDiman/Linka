import { useState } from "react"
import { Link } from "react-router-dom"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"

export default function RecoveryPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || "Error al enviar el correo")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title="Recuperar Contraseña" subtitle="Te enviaremos un enlace para restablecerla">
            <Card>
                <CardContent className="pt-6">
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="text-green-600 font-medium">
                                ¡Correo enviado! Revisa tu bandeja de entrada.
                            </div>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRecovery} className="space-y-6">
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
                                    className="mt-1"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar enlace"}
                            </Button>
                            <div className="text-center text-sm">
                                <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                                    Volver
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
