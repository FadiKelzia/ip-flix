import { NextResponse } from 'next/server';
import { getBasicClientInfo, getUserAgentInfo } from '@/lib/getClientInfo';

export const runtime = 'edge';

export async function GET() {
  try {
    const basicInfo = await getBasicClientInfo();
    const userAgentInfo = await getUserAgentInfo();

    const response = {
      ...basicInfo,
      ...userAgentInfo,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('IP API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve IP information' },
      { status: 500 }
    );
  }
}
