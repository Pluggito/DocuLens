import { extractText } from './ocr';
import { classifyDocument, classifyDocumentWithVision, type DocumentClassification } from './classify';
import { extractStructuredData, extractStructuredDataWithVision } from './extract';
import { crossValidateExtractions } from './cross-validate';

export interface ProcessingResult {
  classification: DocumentClassification;
  extractedData: Record<string, unknown>;
  rawText: string;
  processingTimeMs: number;
  conflicts?: Record<string, { ocr: unknown; vision: unknown }>;
}

export async function processDocument(
  fileUrl: string, 
  mimeType?: string,
  forcedType?: string,
  onProgress?: (message: string) => void
): Promise<ProcessingResult> {
  const startTime = Date.now();

  // Stage 1: Fast Classification
  onProgress?.('Classifying document...');
  let classification: DocumentClassification;
  
  if (forcedType) {
    classification = {
      documentType: forcedType as any,
      confidence: 1.0,
      reasoning: "Manually overridden by user",
    };
  } else {
    try {
      classification = await classifyDocumentWithVision(fileUrl, mimeType);
    } catch (e) {
      // Fallback to OCR text if Vision classification fails
      onProgress?.('Vision classification failed, falling back to OCR...');
      const rawText = await extractText(fileUrl, mimeType);
      classification = await classifyDocument(rawText);
    }
  }

  // Stage 2: Parallel Extraction
  onProgress?.('Running OCR and Vision extraction in parallel...');
  let rawText = '';
  
  const ocrPromise = (async () => {
    try {
      rawText = await extractText(fileUrl, mimeType);
      // @ts-ignore
      return await extractStructuredData(rawText, classification.documentType as any);
    } catch (e) {
      console.warn('OCR extraction pipeline failed:', e);
      return null;
    }
  })();

  const visionPromise = (async () => {
    try {
      return await extractStructuredDataWithVision(
        fileUrl, 
        // @ts-ignore
        classification.documentType as any, 
        mimeType
      );
    } catch (e) {
      console.warn('Vision extraction pipeline failed:', e);
      return null;
    }
  })();

  const [ocrData, visionData] = await Promise.all([ocrPromise, visionPromise]);

  if (!ocrData && !visionData) {
    throw new Error('Both OCR and Vision extraction pipelines failed.');
  }

  // Stage 3: Cross Validate
  onProgress?.('Cross-validating results...');
  const validationResult = crossValidateExtractions(ocrData as any, visionData as any);

  return {
    classification: {
      ...classification,
      // Blend classification confidence with extraction confidence
      confidence: Math.min(classification.confidence, validationResult.confidence)
    },
    extractedData: validationResult.mergedData,
    conflicts: validationResult.conflicts,
    rawText,
    processingTimeMs: Date.now() - startTime,
  };
}
