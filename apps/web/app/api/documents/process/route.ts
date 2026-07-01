import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents, eq, and } from '@repo/db';
import { processDocument } from '@repo/ai';

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, url } = body;
    
    if (!documentId || !url) {
      return NextResponse.json({ error: 'Missing documentId or url' }, { status: 400 });
    }

    const db = getDb();

    // Verify ownership
    const [existing] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    // Update status to processing
    await db.update(documents)
      .set({ processingStatus: 'processing' })
      .where(eq(documents.id, documentId));

    try {
      // Process the document with the AI package
      const result = await processDocument(url, existing.mimeType);

      // Update with results
      const [updated] = await db.update(documents)
        .set({
          processingStatus: 'completed',
          documentType: result.classification.documentType,
          confidence: result.classification.confidence,
          extractedData: result.extractedData,
          classificationReasoning: result.classification.reasoning,
          rawText: result.rawText,
          processingTimeMs: result.processingTimeMs,
        })
        .where(eq(documents.id, documentId))
        .returning();

      return NextResponse.json({ document: updated });
    } catch (processError) {
      console.error('Processing error:', processError);
      await db.update(documents)
        .set({ 
          processingStatus: 'failed', 
          processingError: processError instanceof Error ? processError.message : 'Unknown processing error' 
        })
        .where(eq(documents.id, documentId));
        
      return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
