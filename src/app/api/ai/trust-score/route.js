import { NextResponse } from 'next/server';
import { calculateTrustScore } from '@/lib/ai/openrouter';

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, rating, hotelAmenities } = body;

    if (!text) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 });
    }

    const analysis = await calculateTrustScore({ text, rating, hotelAmenities });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Trust score error:', error);
    return NextResponse.json({ error: 'Failed to calculate trust score' }, { status: 500 });
  }
}
