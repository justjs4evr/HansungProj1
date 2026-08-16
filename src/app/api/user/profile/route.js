import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import { auth } from '@/auth';

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { displayName, bio } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    revalidatePath(`/user/${user.username}`);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
