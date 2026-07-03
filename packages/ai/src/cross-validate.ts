export interface CrossValidationResult {
  mergedData: Record<string, unknown>;
  confidence: number;
  conflicts: Record<string, { ocr: unknown; vision: unknown }>;
}

/**
 * Heuristic to determine if a field is numeric/date-like.
 * Matches things like amounts, totals, dates.
 */
function isNumericOrDateKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('amount') || 
         lowerKey.includes('total') || 
         lowerKey.includes('date') || 
         lowerKey.includes('number') || 
         lowerKey.includes('price') ||
         lowerKey.includes('tax');
}

export function crossValidateExtractions(
  ocrData: Record<string, unknown> | null,
  visionData: Record<string, unknown> | null
): CrossValidationResult {
  const mergedData: Record<string, unknown> = {};
  const conflicts: Record<string, { ocr: unknown; vision: unknown }> = {};
  
  if (!ocrData && !visionData) {
    return { mergedData, confidence: 0, conflicts };
  }
  
  if (!ocrData && visionData) {
    return { mergedData: visionData, confidence: 0.8, conflicts };
  }
  
  if (ocrData && !visionData) {
    return { mergedData: ocrData, confidence: 0.8, conflicts };
  }

  // Both exist, so let's merge
  const allKeys = new Set([...Object.keys(ocrData!), ...Object.keys(visionData!)]);
  
  let totalScore = 0;
  let fieldCount = 0;

  allKeys.forEach(key => {
    const ocrVal = ocrData![key];
    const visionVal = visionData![key];

    // Normalize empty strings to null for easier comparison
    const normalizedOcr = ocrVal === "" ? null : ocrVal;
    const normalizedVision = visionVal === "" ? null : visionVal;

    fieldCount++;

    // Perfect Match (or both null)
    if (JSON.stringify(normalizedOcr) === JSON.stringify(normalizedVision)) {
      mergedData[key] = normalizedOcr;
      totalScore += 1.0;
      return;
    }

    // Missing field (one found it, one didn't)
    if (normalizedOcr == null && normalizedVision != null) {
      mergedData[key] = normalizedVision;
      totalScore += 0.8;
      return;
    }
    
    if (normalizedOcr != null && normalizedVision == null) {
      mergedData[key] = normalizedOcr;
      totalScore += 0.8;
      return;
    }

    // Conflict Resolution
    if (isNumericOrDateKey(key)) {
      // High-stakes conflict: numeric/dates. Flag as conflict, defer to HITL.
      mergedData[key] = normalizedVision; // take vision as placeholder, but it will be flagged
      conflicts[key] = { ocr: normalizedOcr, vision: normalizedVision };
      totalScore += 0.3; // Low confidence drops the overall score
    } else {
      // Text fields: take Vision as it handles layout/fonts better
      mergedData[key] = normalizedVision;
      // We still mark some penalty since they disagreed, but relatively high since we trust vision
      totalScore += 0.9;
    }
  });

  const averageConfidence = fieldCount === 0 ? 0 : totalScore / fieldCount;

  return {
    mergedData,
    // Cap confidence at 0.84 if there are high-stakes conflicts, to ensure it triggers HITL
    confidence: Math.min(averageConfidence, Object.keys(conflicts).length > 0 ? 0.84 : 1.0),
    conflicts
  };
}
