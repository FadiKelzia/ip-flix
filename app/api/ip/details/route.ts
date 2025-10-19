import { NextRequest, NextResponse } from 'next/server';
import { getDetailedNetworkInfo } from '@/lib/getClientInfo';

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

    const detailedInfo = await getDetailedNetworkInfo(ip);

    // Add mock security info (would need paid API for real detection)
    const response = {
      ...detailedInfo,
      security: {
        isVpn: false,
        isProxy: false,
        isTor: false,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Detailed IP API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve detailed IP information' },
      { status: 500 }
    );
  }
}
