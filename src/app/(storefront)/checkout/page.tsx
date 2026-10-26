import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/db';
import { users, userAddresses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/auth/login?redirect=/checkout');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/auth/login?redirect=/checkout');
  }

  // Fetch full user details
  const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
  
  if (!user) {
    redirect('/auth/login?redirect=/checkout');
  }

  // Fetch user addresses
  const addresses = await db.select().from(userAddresses).where(eq(userAddresses.userId, user.id));

  // Pass data to the client component
  return (
    <CheckoutClient 
      user={{
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || ""
      }} 
      savedAddresses={addresses} 
    />
  );
}