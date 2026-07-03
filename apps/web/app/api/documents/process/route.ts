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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Send initial start event
          sendEvent('progress', { step: 'Initializing parallel extraction pipeline...' });

          const result = await processDocument(
            url, 
            existing.mimeType, 
            undefined, 
            (message: string) => {
              sendEvent('progress', { step: message });
            }
          );

          sendEvent('progress', { step: 'Saving extracted results...' });

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

          sendEvent('complete', { document: updated });
          controller.close();
        } catch (processError) {
          console.error('Processing error:', processError);
          await db.update(documents)
            .set({ 
              processingStatus: 'failed', 
              processingError: processError instanceof Error ? processError.message : 'Unknown processing error' 
            })
            .where(eq(documents.id, documentId));
            
          sendEvent('error', { message: 'Failed to process document' });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
