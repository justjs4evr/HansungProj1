import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User, Hotel, Review } from '@/lib/db/models';
import { calculateTrustScore } from '@/lib/ai/openrouter';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { hotelId, text, rating, username = 'alice' } = body;

    if (!hotelId || !text || !rating) {
      return NextResponse.json({ error: 'Hotel ID, text, and rating are required.' }, { status: 400 });
    }

    // Find user and hotel
    const user = await User.findOne({ username });
    const hotel = await Hotel.findById(hotelId);

    if (!user || !hotel) {
      return NextResponse.json({ error: 'User or Hotel not found.' }, { status: 404 });
    }

    // Check daily limits (simple check)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReviewCount = await Review.countDocuments({
      userId: user._id,
      createdAt: { $gte: today }
    });

    if (todayReviewCount >= (user.reviewLimit || 3)) {
      return NextResponse.json({
        error: `Daily review limit reached (${todayReviewCount}/${user.reviewLimit || 3}). Verify your account to increase your limit!`
      }, { status: 429 });
    }

    // Calculate real-time AI trust score using OpenRouter (NVIDIA Nemotron)
    let aiTrustScore = 85;
    let aiAnalysis = { reasoning_summary: 'AI trust evaluation pending.' };

    try {
      const result = await calculateTrustScore({
        text,
        rating: Number(rating),
        hotelAmenities: hotel.amenities
      });
      aiTrustScore = result.overallScore;
      aiAnalysis = result;
    } catch (aiErr) {
      console.warn('AI calculation fallback:', aiErr);
    }

    // Save review to MongoDB
    const newReview = await Review.create({
      userId: user._id,
      hotelId: hotel._id,
      text,
      rating: Number(rating),
      verifiedBooking: user.verificationStatus,
      aiTrustScore,
      aiAnalysis,
      moderationStatus: 'approved'
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
