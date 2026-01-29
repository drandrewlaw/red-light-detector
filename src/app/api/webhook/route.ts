import { NextRequest, NextResponse } from 'next/server';

// In-memory store for violations (in production, use a database)
// This is shared across webhook calls
const violations: Array<{
    id: string;
    timestamp: string;
    sourceUrl: string;
    condition: string;
    triggered: boolean;
    explanation: string;
    frameB64?: string;
}> = [];

// POST - Receive webhook from VibeStream
export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        console.log('Webhook received:', JSON.stringify(payload, null, 2));

        // Validate payload structure
        if (payload.type !== 'watch_triggered') {
            return NextResponse.json(
                { error: 'Unknown webhook type' },
                { status: 400 }
            );
        }

        // Extract violation data
        const violation = {
            id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: payload.timestamp,
            sourceUrl: payload.source_url,
            condition: payload.data.condition,
            triggered: payload.data.triggered,
            explanation: payload.data.explanation,
            frameB64: payload.data.frame_b64,
        };

        // Store violation (in memory for now)
        violations.unshift(violation);

        // Keep only last 100 violations
        if (violations.length > 100) {
            violations.pop();
        }

        console.log(`🚨 Red light violation detected! Total: ${violations.length}`);

        return NextResponse.json({
            success: true,
            message: 'Violation logged',
            violationId: violation.id,
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// GET - Retrieve all violations
export async function GET() {
    return NextResponse.json({
        violations,
        count: violations.length,
    });
}
