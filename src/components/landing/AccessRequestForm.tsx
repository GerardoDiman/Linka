import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { motion } from "framer-motion"
import { supabase } from "../../lib/supabase"
import { sendN8NWebhook } from "../../lib/webhooks"

export function AccessRequestForm() {
    const [email, setEmail] = useState("")
    const [comments, setComments] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const normalizedEmail = email.toLowerCase().trim()
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email: normalizedEmail, comments }])

            if (error) throw error

            // Send webhook to n8n
            await sendN8NWebhook("waitlist_request", {
                email,
                comments
            })

            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || "Error al enviar la solicitud")
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-green-50 rounded-lg border border-green-100"
            >
                <h3 className="text-lg font-semibold text-green-800">¡Solicitud enviada con éxito!</h3>
                <p className="text-green-600">Tu solicitud está en revisión. Te notificaremos por correo cuando sea aprobada para que puedas registrarte.</p>
            </motion.div>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Solicitar Acceso Anticipado</CardTitle>
                <CardDescription>
                    Únete a la lista de espera y sé de los primeros en probar Linka.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            required
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">¿Por qué quieres acceso?</label>
                        <Textarea
                            placeholder="Cuéntanos un poco sobre cómo planeas usar Linka..."
                            value={comments}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Enviando..." : "Unirme a la lista"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
