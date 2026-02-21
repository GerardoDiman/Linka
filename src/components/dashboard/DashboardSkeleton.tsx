import { Skeleton } from "../ui/Skeleton"

export function DashboardSkeleton() {
    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-hidden">
            {/* Sidebar Skeleton */}
            <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Skeleton variant="circle" width={32} height={32} />
                    <Skeleton width={100} height={20} />
                </div>

                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-2">
                            <Skeleton variant="rectangle" width={24} height={24} className="rounded" />
                            <Skeleton width={60 + (i * 15 % 40)} height={16} />
                        </div>
                    ))}
                </div>

                <div className="mt-auto p-2">
                    <Skeleton variant="rectangle" height={80} className="w-full rounded-xl opacity-50" />
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Navbar Skeleton */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <Skeleton width={200} height={32} className="hidden md:block rounded-lg" />
                        <Skeleton width={120} height={32} className="md:hidden rounded-lg" />
                    </div>

                    <div className="flex items-center gap-3">
                        <Skeleton variant="circle" width={36} height={36} />
                        <Skeleton variant="circle" width={36} height={36} />
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                        <Skeleton width={120} height={36} className="rounded-full" />
                    </div>
                </header>

                {/* Graph Area Skeleton */}
                <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
                    {/* Grid Effect Placeholder */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

                    {/* Ghost Nodes */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute border border-slate-200 dark:border-slate-800/50 rounded-2xl p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                                style={{
                                    left: `${20 + (i % 3) * 30}%`,
                                    top: `${20 + Math.floor(i / 3) * 30}%`,
                                    width: '180px',
                                    opacity: 0.3 - (i * 0.02)
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Skeleton variant="circle" width={24} height={24} />
                                    <Skeleton width={80} height={14} />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton width="100%" height={8} />
                                    <Skeleton width="70%" height={8} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Loading Message */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                                Cargando tu ecosistema...
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
