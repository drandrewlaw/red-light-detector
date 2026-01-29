import { NextResponse } from 'next/server';

const VIBESTREAM_API_URL = 'https://vibestream.machinefi.com';
const FRESNO_STREAM = 'https://www.youtube.com/watch?v=NK3S_T0Sabk';

// In-memory store for density readings
const densityReadings: Array<{
    id: string;
    timestamp: string;
    carCount: number;
    explanation: string;
    frameB64?: string;
}> = [];

// POST - Get current density reading
export async function POST() {
    try {
        const response = await fetch(`${VIBESTREAM_API_URL}/check-once`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                youtube_url: FRESNO_STREAM,
                condition: `Count the number of vehicles (cars, trucks, motorcycles) currently visible at this intersection. 
        
        Respond with ONLY a JSON object in this exact format:
        {"count": NUMBER, "description": "brief description of traffic"}
        
        Where NUMBER is the total vehicle count you can see.`,
                model: 'gemini-2.5-flash',
                include_frame: true,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`VibeStream API error: ${response.status} - ${error}`);
        }

        const result = await response.json();

        // Parse the car count from the explanation
        let carCount = 0;
        let description = result.explanation;

        try {
            // Try to parse JSON from the explanation
            const jsonMatch = result.explanation.match(/\{[^}]+\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                carCount = parsed.count || 0;
                description = parsed.description || result.explanation;
            } else {
                // Fallback: try to find a number in the text
                const numberMatch = result.explanation.match(/\b(\d+)\b/);
                if (numberMatch) {
                    carCount = parseInt(numberMatch[1], 10);
                }
            }
        } catch {
            // If parsing fails, try to extract number from text
            const numberMatch = result.explanation.match(/\b(\d+)\b/);
            if (numberMatch) {
                carCount = parseInt(numberMatch[1], 10);
            }
        }

        const reading = {
            id: `density_${Date.now()}`,
            timestamp: new Date().toISOString(),
            carCount,
            explanation: description,
            frameB64: result.frame_b64,
        };

        // Store reading
        densityReadings.unshift(reading);

        // Keep only last 60 readings (1 hour at 1 min intervals)
        if (densityReadings.length > 60) {
            densityReadings.pop();
        }

        return NextResponse.json({
            success: true,
            reading,
        });
    } catch (error) {
        console.error('Density check error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Density check failed' },
            { status: 500 }
        );
    }
}

// GET - Retrieve all density readings
export async function GET() {
    // Calculate stats
    const readings = densityReadings;
    const counts = readings.map(r => r.carCount);

    const stats = {
        current: counts[0] || 0,
        average: counts.length > 0 ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0,
        peak: counts.length > 0 ? Math.max(...counts) : 0,
        low: counts.length > 0 ? Math.min(...counts) : 0,
    };

    // Find peak hour (group by hour)
    const hourlyData: { [key: string]: number[] } = {};
    readings.forEach(r => {
        const hour = new Date(r.timestamp).getHours();
        const key = `${hour}:00`;
        if (!hourlyData[key]) hourlyData[key] = [];
        hourlyData[key].push(r.carCount);
    });

    let peakHour = '';
    let peakAvg = 0;
    Object.entries(hourlyData).forEach(([hour, counts]) => {
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        if (avg > peakAvg) {
            peakAvg = avg;
            peakHour = hour;
        }
    });

    return NextResponse.json({
        readings,
        stats: {
            ...stats,
            peakHour: peakHour || 'N/A',
            peakHourAverage: Math.round(peakAvg),
        },
        count: readings.length,
    });
}
