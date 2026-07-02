import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents, eq, and } from '@repo/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Fetch the document, ensuring it belongs to the current user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { extractedData } = body;

    if (!extractedData) {
      return NextResponse.json({ error: 'extractedData is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Update the document
    const [updatedDocument] = await db
      .update(documents)
      .set({ 
        extractedData,
        processingStatus: 'verified',
      })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    if (!updatedDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Fetch the document first to get the fileUrl
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Try to delete from Vercel Blob (we don't want to fail if it's already gone, but we should await it)
    try {
      const { del } = await import('@vercel/blob');
      await del(document.fileUrl);
    } catch (blobError) {
      console.warn('Failed to delete blob from Vercel, continuing to delete DB record:', blobError);
    }

    // Delete from DB
    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

