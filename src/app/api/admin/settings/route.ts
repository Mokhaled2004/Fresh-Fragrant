import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';

// GET — returns the single settings row (creates default if missing)
export async function GET() {
  try {
    let [settings] = await db.select().from(adminSettings).limit(1);
    if (!settings) {
      [settings] = await db.insert(adminSettings).values({}).returning();
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — upsert the settings row
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    let [existing] = await db.select().from(adminSettings).limit(1);

    if (!existing) {
      // Create with provided values
      const [created] = await db.insert(adminSettings).values({
        ...body,
        updatedAt: new Date(),
      }).returning();
      return NextResponse.json({ settings: created });
    }

    // Update existing
    const [updated] = await db
      .update(adminSettings)
      .set({ ...body, updatedAt: new Date() })
      .returning();

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
