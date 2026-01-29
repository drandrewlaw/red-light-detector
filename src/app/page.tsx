'use client';

import { useState, useEffect, useCallback } from 'react';
import { MonitoringControl } from '@/components/MonitoringControl';
import { ViolationLog } from '@/components/ViolationLog';
import { DensityStats } from '@/components/DensityStats';
import { DensityChart } from '@/components/DensityChart';
import { Violation } from '@/lib/types';

const FRESNO_STREAM = 'https://www.youtube.com/watch?v=NK3S_T0Sabk';

interface DensityReading {
  id: string;
  timestamp: string;
  carCount: number;
  explanation: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'violations' | 'density'>('density');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitoringStats, setMonitoringStats] = useState<{
    checksPerformed?: number;
    triggersFired?: number;
    framesSkipped?: number;
  }>({});

  // Density state
  const [densityReadings, setDensityReadings] = useState<DensityReading[]>([]);
  const [densityStats, setDensityStats] = useState({
    current: 0,
    average: 0,
    peak: 0,
    low: 0,
    peakHour: 'N/A',
    peakHourAverage: 0,
  });
  const [isDensityLoading, setIsDensityLoading] = useState(false);
  const [lastDensityCheck, setLastDensityCheck] = useState<string | undefined>();

  // Fetch violations
  const fetchViolations = useCallback(async () => {
    try {
      const response = await fetch('/api/webhook');
      const data = await response.json();
      setViolations(data.violations || []);
    } catch (err) {
      console.error('Failed to fetch violations:', err);
    }
  }, []);

  // Fetch density readings
  const fetchDensityReadings = useCallback(async () => {
    try {
      const response = await fetch('/api/density');
      const data = await response.json();
      setDensityReadings(data.readings || []);
      if (data.stats) {
        setDensityStats(data.stats);
      }
      if (data.readings?.length > 0) {
        setLastDensityCheck(data.readings[0].timestamp);
      }
    } catch (err) {
      console.error('Failed to fetch density readings:', err);
    }
  }, []);

  // Check density now
  const checkDensityNow = async () => {
    setIsDensityLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/density', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Density check failed');
      }

      // Refresh readings
      await fetchDensityReadings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Density check failed');
    } finally {
      setIsDensityLoading(false);
    }
  };

  // Poll for data
  useEffect(() => {
    fetchViolations();
    fetchDensityReadings();

    if (isMonitoring) {
      const interval = setInterval(fetchViolations, 10000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, fetchViolations, fetchDensityReadings]);

  // Auto-poll density every 60 seconds when on density tab
  useEffect(() => {
    if (activeTab === 'density') {
      const interval = setInterval(() => {
        checkDensityNow();
      }, 60000); // Every 60 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Start monitoring
  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: FRESNO_STREAM }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start monitoring');
      }

      setJobId(data.job_id);
      setIsMonitoring(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop monitoring
  const handleStop = async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', job_id: jobId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop monitoring');
      }

      setIsMonitoring(false);
      setJobId(null);
      setMonitoringStats({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <span className="text-2xl">🚦</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Traffic Cam Agent
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Fresno, CA • Friant & Shepherd
                  </p>
                </div>
              </div>
              {isMonitoring && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-400">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('density')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'density'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
            >
              📊 Traffic Density
            </button>
            <button
              onClick={() => setActiveTab('violations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'violations'
                ? 'bg-red-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
            >
              🚨 Red Light Violations
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main grid */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'density' ? (
            /* Traffic Density Tab */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - Density stats */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100">Traffic Density</h2>
                    <p className="text-sm text-zinc-400">Real-time vehicle count</p>
                  </div>
                </div>
                <DensityStats
                  stats={densityStats}
                  isLoading={isDensityLoading}
                  onCheck={checkDensityNow}
                  lastChecked={lastDensityCheck}
                />
              </div>

              {/* Right - Chart */}
              <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100">Traffic History</h2>
                    <p className="text-sm text-zinc-400">{densityReadings.length} readings captured</p>
                  </div>
                </div>
                <DensityChart readings={densityReadings} />
              </div>
            </div>
          ) : (
            /* Violations Tab */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - Control panel */}
              <div className="space-y-6">
                <MonitoringControl
                  isMonitoring={isMonitoring}
                  jobId={jobId}
                  onStart={handleStart}
                  onStop={handleStop}
                  isLoading={isLoading}
                  stats={monitoringStats}
                />

                {/* Stream info */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">Monitoring Stream</h3>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 mb-1">Fresno Traffic Camera</p>
                    <p className="text-xs text-zinc-400 font-mono truncate">
                      {FRESNO_STREAM}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Checking every 15 seconds</span>
                  </div>
                </div>
              </div>

              {/* Right - Violation log */}
              <div className="lg:col-span-2">
                <ViolationLog
                  violations={violations}
                  onRefresh={fetchViolations}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <p className="text-sm text-zinc-500">
              Powered by <a href="https://iotex.mintlify.app" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">VibeStream API</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
