import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { isNull } from 'drizzle-orm';

// GET all categories
export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .where(isNull(categories.deletedAt));

    return NextResponse.json(allCategories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new category & handle extended options
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    let slug = formData.get('slug') as string;
    const parentCategoryId = formData.get('parentCategoryId') as string;
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string, 10) : 0;
    const isActive = formData.get('isActive') === 'true';
    const metadataString = formData.get('metadata') as string;
    const file = formData.get('image') as File;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    if (!slug) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    let metadata = {};
    try {
      if (metadataString) metadata = JSON.parse(metadataString);
    } catch (e) {
      metadata = {};
    }

    let imageUrl = '';
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const folderName = slug;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'categories', folderName);
      await mkdir(uploadDir, { recursive: true });

      const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fullPath = path.join(uploadDir, filename);
      await writeFile(fullPath, buffer);

      imageUrl = `/images/categories/${folderName}/${filename}`;
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentCategoryId: parentCategoryId && parentCategoryId !== '' ? parentCategoryId : null,
        displayOrder,
        isActive,
        metadata,
      })
      .returning();

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}