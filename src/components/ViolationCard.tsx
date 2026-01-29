'use client';

import { Violation } from '@/lib/types';

interface ViolationCardProps {
    violation: Violation;
}

export function ViolationCard({ violation }: ViolationCardProps) {
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-red-500/30 hover:border-red-500/50 transition-colors">
            <div className="flex gap-4">
                {/* Frame thumbnail */}
                {violation.frameB64 && (
                    <div className="flex-shrink-0">
                        <img
                            src={`data:image/jpeg;base64,${violation.frameB64}`}
                            alt="Violation frame"
                            className="w-32 h-24 object-cover rounded-lg border border-zinc-700"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded">
                            VIOLATION
                        </span>
                        <span className="text-xs text-zinc-500">{formatDate(violation.timestamp)}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">{formatTime(violation.timestamp)}</span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                        {violation.explanation}
                    </p>
                </div>
            </div>
        </div>
    );
}
