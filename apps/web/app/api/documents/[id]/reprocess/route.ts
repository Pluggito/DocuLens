import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents, eq, and } from '@repo/db';
import { processDocument } from '@repo/ai';

export async function POST(
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
    
    // Fetch the document
    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Reset status to processing and clear previous extraction data
    await db.update(documents)
      .set({ 
        processingStatus: 'processing',
        extractedData: null,
        confidence: null,
        processingError: null
      })
      .where(eq(documents.id, id));

    try {
      // Process the document with the AI package
      const result = await processDocument(existing.fileUrl, existing.mimeType);

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
        .where(eq(documents.id, id))
        .returning();

      return NextResponse.json({ document: updated });
    } catch (processError) {
      console.error('Reprocessing error:', processError);
      await db.update(documents)
        .set({ 
          processingStatus: 'failed', 
          processingError: processError instanceof Error ? processError.message : 'Unknown processing error' 
        })
        .where(eq(documents.id, id));
        
      return NextResponse.json({ error: 'Failed to reprocess document' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to handle reprocess request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
