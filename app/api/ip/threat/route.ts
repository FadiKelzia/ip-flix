import { NextRequest, NextResponse } from 'next/server';
import { getThreatIntelligence, getASNDetails } from '@/lib/threatIntelligence';

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

    const [threatData, asnData] = await Promise.all([
      getThreatIntelligence(ip),
      getASNDetails(ip),
    ]);

    return NextResponse.json(
      {
        threat: threatData,
        asn: asnData,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Threat API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve threat intelligence' },
      { status: 500 }
    );
  }
}
