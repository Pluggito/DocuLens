import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents, eq, and, desc, ilike, or, sql } from '@repo/db';

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const db = await getDb();

    // Build the query conditions
    const conditions = [eq(documents.userId, userId)];

    if (status && status !== 'all') {
      conditions.push(eq(documents.processingStatus, status));
    }

    if (type && type !== 'all') {
      conditions.push(eq(documents.documentType, type));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      const searchCondition = or(
        ilike(documents.fileName, searchTerm),
        // Cast jsonb to text to search within extracted data
        ilike(sql`cast(${documents.extractedData} as text)`, searchTerm)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const results = await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));

    return NextResponse.json({ documents: results });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
