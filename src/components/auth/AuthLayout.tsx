import { Link } from "react-router-dom"
import { Logo } from "../ui/Logo"

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-primary hover:opacity-80 transition-opacity">
                        <Logo size={32} />
                        Linka
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {subtitle}
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
