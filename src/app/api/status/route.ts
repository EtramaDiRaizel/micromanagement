import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, statusHistory } from '@/lib/schema';
import { VALID_STATUSES } from '@/lib/statuses';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    
    const formattedUsers = allUsers.map(user => ({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      currentStatus: user.currentStatus,
      statusUpdatedAt: user.statusUpdatedAt,
    }));

    return NextResponse.json({ success: true, data: { users: formattedUsers } });
  } catch (error) {
    console.error('GET /api/status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const [existingUser] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        currentStatus: users.currentStatus,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const previousStatus = existingUser.currentStatus;
    const now = new Date().toISOString();

    await db.update(users)
      .set({
        currentStatus: status,
        statusUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    await db.insert(statusHistory).values({
      id: crypto.randomUUID(),
      userId,
      previousStatus,
      newStatus: status,
      changedAt: now,
    });

    const updatedUserStatus = {
      userId,
      username: existingUser.username,
      displayName: existingUser.displayName,
      currentStatus: status,
      statusUpdatedAt: now,
    };

    return NextResponse.json({ success: true, data: updatedUserStatus });
  } catch (error) {
    console.error('PUT /api/status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
