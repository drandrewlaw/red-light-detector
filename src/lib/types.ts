// Types for Red Light Runner Detector

export interface Violation {
    id: string;
    timestamp: string;
    sourceUrl: string;
    condition: string;
    triggered: boolean;
    explanation: string;
    frameB64?: string;
}

export interface WatchJob {
    jobId: string;
    status: 'pending' | 'running' | 'stopped' | 'completed' | 'failed';
    jobType: string;
    createdAt: string;
    youtubeUrl: string;
    details: {
        condition: string;
        intervalSeconds: number;
        model: string;
        checksPerformed?: number;
        triggersFired?: number;
        framesSkipped?: number;
    };
}

export interface WebhookPayload {
    type: 'watch_triggered';
    timestamp: string;
    source_url: string;
    data: {
        condition: string;
        triggered: boolean;
        explanation: string;
        frame_b64?: string;
    };
}
