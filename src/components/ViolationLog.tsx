'use client';

import { Violation } from '@/lib/types';
import { ViolationCard } from './ViolationCard';

interface ViolationLogProps {
    violations: Violation[];
    onRefresh: () => void;
    isLoading: boolean;
}

export function ViolationLog({ violations, onRefresh, isLoading }: ViolationLogProps) {
    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Violation Log</h2>
                        <p className="text-sm text-zinc-400">{violations.length} violations detected</p>
                    </div>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {violations.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <svg className="h-16 w-16 text-zinc-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4 text-zinc-400">No violations detected yet</p>
                    <p className="text-xs text-zinc-500 mt-1">Violations will appear here when detected</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {violations.map((violation) => (
                        <ViolationCard key={violation.id} violation={violation} />
                    ))}
                </div>
            )}
        </div>
    );
}
