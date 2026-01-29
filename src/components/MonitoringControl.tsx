'use client';

interface MonitoringControlProps {
    isMonitoring: boolean;
    jobId: string | null;
    onStart: () => void;
    onStop: () => void;
    isLoading: boolean;
    stats?: {
        checksPerformed?: number;
        triggersFired?: number;
        framesSkipped?: number;
    };
}

export function MonitoringControl({
    isMonitoring,
    jobId,
    onStart,
    onStop,
    isLoading,
    stats,
}: MonitoringControlProps) {
    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${isMonitoring
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/25'
                        : 'bg-gradient-to-br from-zinc-600 to-zinc-500 shadow-zinc-500/25'
                    }`}>
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-100">Monitoring Status</h2>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
                        <span className="text-sm text-zinc-400">
                            {isMonitoring ? 'Active - Watching for violations' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {isMonitoring && stats && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{stats.checksPerformed || 0}</p>
                        <p className="text-xs text-zinc-500">Checks</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-red-400">{stats.triggersFired || 0}</p>
                        <p className="text-xs text-zinc-500">Violations</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-zinc-400">{stats.framesSkipped || 0}</p>
                        <p className="text-xs text-zinc-500">Skipped</p>
                    </div>
                </div>
            )}

            {jobId && (
                <p className="text-xs text-zinc-500 mb-4 font-mono truncate">
                    Job ID: {jobId}
                </p>
            )}

            {/* Control buttons */}
            <div className="flex gap-3">
                {!isMonitoring ? (
                    <button
                        onClick={onStart}
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Starting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Start Monitoring</span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={onStop}
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        <span>Stop Monitoring</span>
                    </button>
                )}
            </div>
        </div>
    );
}
