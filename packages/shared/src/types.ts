import { z } from "zod";

// ─── Document Types ───

export const DOCUMENT_TYPES = [
  "invoice",
  "receipt",
  "cv",
  "contract",
  "bank_statement",
  "id_document",
  "letter",
  "generic",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  receipt: "Receipt",
  cv: "CV / Resume",
  contract: "Contract",
  bank_statement: "Bank Statement",
  id_document: "ID Document",
  letter: "Letter",
  generic: "Generic Document",
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  invoice: "📄",
  receipt: "🧾",
  cv: "📋",
  contract: "📝",
  bank_statement: "🏦",
  id_document: "🪪",
  letter: "✉️",
  generic: "📎",
};

// ─── Processing Status ───

export const PROCESSING_STATUSES = [
  "uploading",
  "processing",
  "completed",
  "failed",
  "needs_review",
] as const;

export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const processingStatusSchema = z.enum(PROCESSING_STATUSES);

export const PROCESSING_STATUS_LABELS: Record<ProcessingStatus, string> = {
  uploading: "Uploading",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  needs_review: "Needs Review",
};

export const PROCESSING_STATUS_COLORS: Record<ProcessingStatus, string> = {
  uploading: "#3B82F6", // blue
  processing: "#F59E0B", // amber
  completed: "#10B981", // emerald
  failed: "#EF4444", // red
  needs_review: "#8B5CF6", // violet
};
