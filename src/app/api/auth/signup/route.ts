import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, carts, wishlists, notifications } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Insert user
    const [newUser] = await db.insert(users).values({
      fullName,
      email,
      passwordHash,
      role: 'customer',
    }).returning();

    // Automatically provision an empty Cart and Wishlist for the user
    await db.insert(carts).values({ userId: newUser.id });
    await db.insert(wishlists).values({ userId: newUser.id });

    // Insert new_user notification
    await db.insert(notifications).values({
      type: 'new_user',
      title: 'New Customer Registered',
      message: `${fullName} just created an account.`,
      referenceId: newUser.id,
      referenceType: 'user',
    });

    return NextResponse.json({ message: 'Account created successfully', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}