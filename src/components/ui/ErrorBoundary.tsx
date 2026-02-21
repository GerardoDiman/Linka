import React, { Component, type ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { Button } from './button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    private handleReset = () => {
        // Optionally clear local storage if it's a corrupted state issue
        // localStorage.removeItem('linka_graph_positions_...') 
        window.location.reload()
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-red-200 dark:border-red-900">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                                Algo salió mal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                Ocurrió un error inesperado en la aplicación. Nuestro equipo técnico ha sido notificado (en teoría 😉).
                            </p>

                            {this.state.error && (
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs font-mono text-slate-500 overflow-auto max-h-32">
                                    {this.state.error.message}
                                </div>
                            )}

                            <Button
                                onClick={this.handleReset}
                                className="w-full flex justify-center items-center gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Recargar página
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
