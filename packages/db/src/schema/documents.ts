import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  real,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { createId } from "../utils";

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // File metadata
    fileName: varchar("file_name", { length: 500 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size").notNull(), // bytes
    mimeType: varchar("mime_type", { length: 100 }).notNull(),

    // AI processing results
    documentType: varchar("document_type", { length: 50 }),
    confidence: real("confidence"),
    rawText: text("raw_text"),
    extractedData: jsonb("extracted_data").$type<Record<string, unknown>>(),
    classificationReasoning: text("classification_reasoning"),

    // Processing state
    processingStatus: varchar("processing_status", { length: 20 })
      .notNull()
      .default("uploading"),
    processingTimeMs: integer("processing_time_ms"),
    processingError: text("processing_error"),

    // Organization
    tags: text("tags")
      .array()
      .default([]),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("documents_user_id_idx").on(table.userId),
    index("documents_document_type_idx").on(table.documentType),
    index("documents_processing_status_idx").on(table.processingStatus),
    index("documents_created_at_idx").on(table.createdAt),
  ]
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
