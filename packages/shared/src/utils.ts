import {
  SUPPORTED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_PDF_SIZE,
  type SupportedMimeType,
} from "./constants";

// ─── Date Formatting ───

/**
 * Format a date to a human-readable string.
 * @example formatDate(new Date()) → "Jun 28, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date to include time.
 * @example formatDateTime(new Date()) → "Jun 28, 2026, 7:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format relative time from now.
 * @example timeAgo(someDate) → "3 hours ago"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// ─── File Size Formatting ───

/**
 * Format bytes to human-readable file size.
 * @example formatFileSize(1536) → "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ─── File Validation ───

/**
 * Check if a MIME type is supported for upload.
 */
export function isSupportedFileType(mimeType: string): mimeType is SupportedMimeType {
  return (SUPPORTED_DOCUMENT_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Get the max file size for a given MIME type.
 */
export function getMaxFileSize(mimeType: string): number {
  return mimeType === "application/pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
}

/**
 * Validate a file for upload (type + size).
 * Returns null if valid, or an error message string.
 */
export function validateFile(
  file: { type: string; size: number; name: string }
): string | null {
  if (!isSupportedFileType(file.type)) {
    return `Unsupported file type: ${file.type}. Accepted: images (JPEG, PNG, TIFF, BMP, WebP) and PDF.`;
  }

  const maxSize = getMaxFileSize(file.type);
  if (file.size > maxSize) {
    return `File too large (${formatFileSize(file.size)}). Maximum: ${formatFileSize(maxSize)}.`;
  }

  return null;
}

// ─── Processing Time ───

/**
 * Format processing time in milliseconds to human-readable.
 * @example formatProcessingTime(2345) → "2.3s"
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Confidence ───

/**
 * Format confidence score as percentage.
 * @example formatConfidence(0.953) → "95.3%"
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

// ─── String Utilities ───

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Generate a slug from a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
