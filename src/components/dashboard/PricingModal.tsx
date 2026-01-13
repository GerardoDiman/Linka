import { useState } from "react"
import { X, Check, Star, Zap, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { supabase } from "../../lib/supabase"
import { useToast } from "../../context/ToastContext"

interface PricingModalProps {
    isOpen: boolean
    onClose: () => void
    currentPlan: 'free' | 'pro'
}

export function PricingModal({ isOpen, onClose, currentPlan }: PricingModalProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    if (!isOpen) return null

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session')

            if (error) throw error
            if (data?.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error("Error initiating checkout:", err)
            toast.error("No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Scrollable Container */}
            <div className="fixed inset-0 overflow-y-auto custom-scrollbar z-10 p-4" onClick={onClose}>
                <div className="flex min-h-full items-center justify-center py-8">
                    <div
                        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Decor */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 md:p-12">
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                                    <Zap className="w-8 h-8 text-primary shadow-lg" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Maximiza tu Visión</h2>
                                <p className="text-slate-400 max-w-md">
                                    Desbloquea todo el potencial de Linka y organiza tus bases de datos de Notion sin límites.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                {/* Free Plan */}
                                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-1">Plan Free</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">$0</span>
                                            <span className="text-slate-500 text-sm">/siempre</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {[
                                            'Hasta 4 bases de datos',
                                            'Filtros básicos',
                                            'Sincronización manual',
                                        ].map((item) => (
                                            <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                                                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        variant="outline"
                                        disabled={currentPlan === 'free'}
                                        className={`w-full bg-transparent border-slate-700 ${currentPlan === 'free' ? 'text-slate-500' : 'text-slate-300'}`}
                                    >
                                        {currentPlan === 'free' ? 'Tu Plan Actual' : 'Plan Base'}
                                    </Button>
                                </div>

                                {/* Pro Plan */}
                                <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/50 flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 bg-primary text-[10px] font-bold text-white px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                        Recomendado
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-white">Plan Pro</h3>
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">$12</span>
                                            <span className="text-slate-400 text-sm">/mes</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {[
                                            'Bases de datos ilimitadas',
                                            'Sincronización automática',
                                            'Colores personalizados pro',
                                            'Soporte prioritario',
                                            'Acceso a futuras funciones',
                                        ].map((item) => (
                                            <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                                                <Check className="w-4 h-4 text-primary shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={handleCheckout}
                                        disabled={currentPlan === 'pro' || loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Iniciando...
                                            </>
                                        ) : (
                                            currentPlan === 'pro' ? 'Tu Plan Actual' : 'Hazte Pro Ahora'
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <p className="mt-8 text-center text-xs text-slate-500">
                                ¿Tienes preguntas? Contáctanos en soporte@linka.io
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
