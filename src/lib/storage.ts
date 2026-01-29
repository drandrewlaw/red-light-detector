// Violation storage using localStorage

import { Violation } from './types';

const STORAGE_KEY = 'red_light_violations';
const MAX_VIOLATIONS = 100;

export function getViolations(): Violation[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function saveViolation(violation: Violation): void {
    if (typeof window === 'undefined') return;

    const violations = getViolations();
    violations.unshift(violation);

    const trimmed = violations.slice(0, MAX_VIOLATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearViolations(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

export function generateViolationId(): string {
    return `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Active job storage
const JOB_KEY = 'active_watch_job';

export function getActiveJob(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(JOB_KEY);
}

export function setActiveJob(jobId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(JOB_KEY, jobId);
}

export function clearActiveJob(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(JOB_KEY);
}
