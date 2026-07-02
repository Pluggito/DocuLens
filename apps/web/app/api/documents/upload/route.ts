import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents, eq, and, gte, desc } from '@repo/db';

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

    const db = getDb();

    // -- RATE LIMITING LOGIC --
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Fetch all user's documents created today, ordered by newest first
    const userDocsToday = await db.select({ createdAt: documents.createdAt })
      .from(documents)
      .where(and(eq(documents.userId, userId), gte(documents.createdAt, startOfDay)))
      .orderBy(desc(documents.createdAt));

    // 1. Enforce Daily Quota (Max 3 per day)
    if (userDocsToday.length >= 3) {
      return NextResponse.json({ 
        error: 'Daily limit reached', 
        message: 'You have reached your daily limit of 3 documents. Please come back tomorrow.' 
      }, { status: 429 });
    }

    // 2. Enforce Cooldown (10 minutes between uploads)
    if (userDocsToday.length > 0) {
      const latestUpload = userDocsToday[0].createdAt;
      const tenMinutesInMs = 10 * 60 * 1000;
      const timeSinceLastUpload = Date.now() - latestUpload.getTime();

      if (timeSinceLastUpload < tenMinutesInMs) {
        const remainingMinutes = Math.ceil((tenMinutesInMs - timeSinceLastUpload) / 60000);
        return NextResponse.json({ 
          error: 'Cooldown active', 
          message: `Please wait ${remainingMinutes} more minute(s) before uploading another document.` 
        }, { status: 429 });
      }
    }
    // -- END RATE LIMITING --

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      multipart: true,
      addRandomSuffix: true,
    });

    // Create DB record
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
