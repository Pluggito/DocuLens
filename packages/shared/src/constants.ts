// ─── File Handling ───

/** Supported image MIME types for document upload */
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
  "image/webp",
] as const;

/** Supported document MIME types */
export const SUPPORTED_DOCUMENT_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  "application/pdf",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_DOCUMENT_TYPES)[number];

/** Max file size in bytes */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB

/** Accepted file extensions for upload inputs */
export const ACCEPTED_FILE_EXTENSIONS = ".jpg,.jpeg,.png,.tiff,.bmp,.webp,.pdf";

// ─── AI Pipeline ───

/** Minimum OCR confidence threshold (0-100) */
export const MIN_OCR_CONFIDENCE = 30;

/** Classification confidence thresholds */
export const CONFIDENCE_THRESHOLDS = {
  /** Above this → auto-accept classification */
  HIGH: 0.85,
  /** Below this → mark as needs_review */
  LOW: 0.5,
} as const;

// ─── Pagination ───

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── App Info ───

export const APP_NAME = "DocuLens AI";
export const APP_DESCRIPTION =
  "AI-powered document intelligence platform. Upload any document and get structured data back automatically.";
export const APP_VERSION = "0.1.0";
