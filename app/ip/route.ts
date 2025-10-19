import { NextResponse } from 'next/server';
import { getClientIP } from '@/lib/getClientInfo';

export const runtime = 'edge';

export async function GET() {
  try {
    const ip = await getClientIP();

    // Return plain text response - perfect for curl
    return new NextResponse(ip, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('IP endpoint error:', error);
    return new NextResponse('Error retrieving IP', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
