'use client';

interface DensityReading {
    id: string;
    timestamp: string;
    carCount: number;
    explanation: string;
}

interface DensityChartProps {
    readings: DensityReading[];
}

export function DensityChart({ readings }: DensityChartProps) {
    // Get last 20 readings for the chart
    const chartData = readings.slice(0, 20).reverse();
    const counts = chartData.map(r => r.carCount);
    const maxCount = counts.length > 0 ? Math.max(...counts, 1) : 10;

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (chartData.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-zinc-500">
                No density data yet. Click "Check Now" to start.
            </div>
        );
    }

    return (
        <div className="h-48">
            {/* Chart */}
            <div className="h-40 flex items-end gap-2 px-2">
                {chartData.map((reading, index) => {
                    // Ensure minimum 10% height for visibility, scale up to 90%
                    const heightPercent = maxCount > 0
                        ? Math.max(10, (reading.carCount / maxCount) * 90)
                        : 10;
                    const isLatest = index === chartData.length - 1;

                    return (
                        <div
                            key={reading.id}
                            className="flex flex-col items-center group relative"
                            style={{
                                flex: '1 1 0',
                                minWidth: chartData.length === 1 ? '60px' : '20px',
                                maxWidth: chartData.length === 1 ? '80px' : undefined
                            }}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                                    <p className="font-semibold text-white">{reading.carCount} cars</p>
                                    <p className="text-zinc-400">{formatTime(reading.timestamp)}</p>
                                </div>
                            </div>

                            {/* Bar with count label */}
                            <div className="w-full flex flex-col items-center">
                                <span className="text-xs text-zinc-400 mb-1 font-medium">{reading.carCount}</span>
                                <div
                                    className={`w-full rounded-t transition-all duration-300 ${isLatest
                                        ? 'bg-gradient-to-t from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/30'
                                        : 'bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300'
                                        }`}
                                    style={{ height: `${heightPercent}px` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-zinc-500 px-2">
                <span>{chartData[0] && formatTime(chartData[0].timestamp)}</span>
                <span>Traffic Density Over Time</span>
                <span>{chartData[chartData.length - 1] && formatTime(chartData[chartData.length - 1].timestamp)}</span>
            </div>
        </div>
    );
}
