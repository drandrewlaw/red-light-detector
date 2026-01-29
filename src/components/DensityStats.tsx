'use client';

interface DensityStatsProps {
    stats: {
        current: number;
        average: number;
        peak: number;
        low: number;
        peakHour: string;
        peakHourAverage: number;
    };
    isLoading: boolean;
    onCheck: () => void;
    lastChecked?: string;
}

export function DensityStats({ stats, isLoading, onCheck, lastChecked }: DensityStatsProps) {
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getDensityLevel = (count: number) => {
        if (count === 0) return { label: 'Empty', color: 'text-zinc-400', bg: 'bg-zinc-500' };
        if (count <= 3) return { label: 'Light', color: 'text-green-400', bg: 'bg-green-500' };
        if (count <= 7) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500' };
        if (count <= 12) return { label: 'Heavy', color: 'text-orange-400', bg: 'bg-orange-500' };
        return { label: 'Congested', color: 'text-red-400', bg: 'bg-red-500' };
    };

    const level = getDensityLevel(stats.current);

    return (
        <div className="space-y-4">
            {/* Current density - large display */}
            <div className="text-center py-4">
                <p className="text-6xl font-bold text-white">{stats.current}</p>
                <p className="text-lg text-zinc-400 mt-1">vehicles at intersection</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`h-2 w-2 rounded-full ${level.bg}`} />
                    <span className={`text-sm font-medium ${level.color}`}>{level.label} Traffic</span>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{stats.average}</p>
                    <p className="text-xs text-zinc-500">Avg Count</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-orange-400">{stats.peak}</p>
                    <p className="text-xs text-zinc-500">Peak Count</p>
                </div>
            </div>

            {/* Peak hour */}
            {stats.peakHour && stats.peakHour !== 'N/A' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-amber-400">Peak Hour: {stats.peakHour}</p>
                            <p className="text-xs text-zinc-500">~{stats.peakHourAverage} vehicles avg</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Last checked */}
            {lastChecked && (
                <p className="text-xs text-zinc-500 text-center">
                    Last checked: {formatTime(lastChecked)}
                </p>
            )}

            {/* Check button */}
            <button
                onClick={onCheck}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Counting...</span>
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Check Now</span>
                    </>
                )}
            </button>
        </div>
    );
}
