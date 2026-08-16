import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { targetUserId, currentUsername = 'alice' } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
    }

    const currentUser = await User.findOne({ username: currentUsername });
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      return NextResponse.json({ error: 'You cannot trust yourself.' }, { status: 400 });
    }

    const isAlreadyTrusted = currentUser.trustedUsers.some(
      (id) => id.toString() === targetUserId
    );

    if (isAlreadyTrusted) {
      // Remove from trusted network
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { trustedUsers: targetUserId }
      });
    } else {
      // Add to trusted network
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { trustedUsers: targetUserId }
      });
    }

    // Revalidate target user profile
    revalidatePath(`/user/${targetUser.username}`);

    return NextResponse.json({
      success: true,
      isTrusted: !isAlreadyTrusted
    });

  } catch (error) {
    console.error('Failed to toggle trust status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
