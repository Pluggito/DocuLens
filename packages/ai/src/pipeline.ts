import { extractText } from './ocr';
import { classifyDocument, type DocumentClassification } from './classify';
import { extractStructuredData } from './extract';

export interface ProcessingResult {
  classification: DocumentClassification;
  extractedData: Record<string, unknown>;
  rawText: string;
  processingTimeMs: number;
}

export async function processDocument(fileUrl: string, mimeType?: string): Promise<ProcessingResult> {
  const startTime = Date.now();

  // Stage 1: OCR
  const rawText = await extractText(fileUrl, mimeType);

  // Stage 2: Classify
  const classification = await classifyDocument(rawText);

  // Stage 3 & 4: Route to schema + Extract
  // @ts-ignore
  const extractedData = await extractStructuredData(
    rawText,
    classification.documentType as any
  );

  return {
    classification,
    extractedData,
    rawText,
    processingTimeMs: Date.now() - startTime,
  };
}
