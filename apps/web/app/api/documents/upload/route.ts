import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents } from '@repo/db';

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      multipart: true,
    });

    // Create DB record
    const db = getDb();
    const [document] = await db.insert(documents).values({
      userId,
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      processingStatus: 'uploading',
    }).returning();

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
