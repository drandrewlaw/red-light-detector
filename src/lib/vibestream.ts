// VibeStream API Client for Watch functionality
// API Docs: https://iotex.mintlify.app/introduction

const VIBESTREAM_API_URL = 'https://vibestream.machinefi.com';

export interface StartWatchRequest {
    youtube_url: string;
    condition: string;
    webhook_url: string;
    interval_seconds?: number;
    model?: string;
}

export interface WatchResponse {
    job_id: string;
    status: string;
    job_type: string;
    created_at: string;
    youtube_url: string;
    details: {
        condition: string;
        interval_seconds: number;
        model: string;
    };
}

export interface JobStatus {
    job_id: string;
    status: string;
    details: {
        checks_performed: number;
        triggers_fired: number;
        frames_skipped: number;
    };
}

/**
 * Start continuous monitoring job
 */
export async function startWatch(request: StartWatchRequest): Promise<WatchResponse> {
    const response = await fetch(`${VIBESTREAM_API_URL}/watch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            youtube_url: request.youtube_url,
            condition: request.condition,
            webhook_url: request.webhook_url,
            interval_seconds: request.interval_seconds || 15,
            model: request.model || 'gemini-2.5-flash',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`VibeStream API error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Get job status and statistics
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${VIBESTREAM_API_URL}/jobs/${jobId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.status}`);
    }

    return response.json();
}

/**
 * Stop a monitoring job
 */
export async function stopJob(jobId: string): Promise<void> {
    const response = await fetch(`${VIBESTREAM_API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to stop job: ${response.status}`);
    }
}

/**
 * List all jobs
 */
export async function listJobs(): Promise<{ jobs: Array<{ id: string; status: string }> }> {
    const response = await fetch(`${VIBESTREAM_API_URL}/jobs`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Failed to list jobs: ${response.status}`);
    }

    return response.json();
}
