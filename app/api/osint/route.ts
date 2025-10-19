import { NextRequest, NextResponse } from 'next/server';
import { getOSINTAnalysis } from '@/lib/osint';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    const osintData = await getOSINTAnalysis(ip);

    return NextResponse.json(osintData, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OSINT API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve OSINT intelligence' },
      { status: 500 }
    );
  }
}
