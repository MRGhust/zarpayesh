import { NextResponse } from 'next/server';
import { fetchLiveTGJU } from '@/lib/rates';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    const data = await fetchLiveTGJU();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('API /api/market error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data', details: error.message },
      { status: 500 }
    );
  }
}
