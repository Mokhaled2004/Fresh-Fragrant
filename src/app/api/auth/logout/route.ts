import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Delete the auth cookie by setting its expiration to the past
  cookieStore.set({
    name: 'auth_token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return NextResponse.json({ message: 'Logged out successfully' });
}