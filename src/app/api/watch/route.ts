import { NextRequest, NextResponse } from 'next/server';
import { startWatch, stopJob, getJobStatus, listJobs } from '@/lib/vibestream';

// POST - Start watching
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { youtube_url, action, job_id } = body;

        // Stop action
        if (action === 'stop' && job_id) {
            await stopJob(job_id);
            return NextResponse.json({
                success: true,
                message: 'Watch job stopped',
            });
        }

        // Status action
        if (action === 'status' && job_id) {
            const status = await getJobStatus(job_id);
            return NextResponse.json({
                success: true,
                ...status,
            });
        }

        // Start new watch
        if (!youtube_url) {
            return NextResponse.json(
                { error: 'youtube_url is required' },
                { status: 400 }
            );
        }

        // Get the app's public URL for the webhook
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const webhookUrl = `${protocol}://${host}/api/webhook`;

        // Red light runner detection condition
        const condition = `Analyze this traffic camera image. 
    Is there any vehicle running a red light? 
    A red light violation occurs when:
    - A vehicle enters or crosses the intersection AFTER the traffic signal has turned red
    - The vehicle should have stopped but proceeded through
    
    Only trigger if you clearly see a violation happening. 
    Do not trigger for normal traffic flow with green lights.`;

        const result = await startWatch({
            youtube_url,
            condition,
            webhook_url: webhookUrl,
            interval_seconds: 15,
            model: 'gemini-2.5-flash',
        });

        return NextResponse.json({
            success: true,
            job_id: result.job_id,
            status: result.status,
            webhook_url: webhookUrl,
            message: 'Started monitoring for red light violations',
        });
    } catch (error) {
        console.error('Watch error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to start watch' },
            { status: 500 }
        );
    }
}

// GET - List all jobs
export async function GET() {
    try {
        const jobs = await listJobs();
        return NextResponse.json(jobs);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to list jobs' },
            { status: 500 }
        );
    }
}
