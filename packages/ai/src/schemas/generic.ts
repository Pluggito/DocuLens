import { z } from "zod";

export const genericSchema = z.object({
  title: z.string().nullable().describe("The main title or heading of the document"),
  date: z.string().nullable().describe("The date mentioned in the document (YYYY-MM-DD format if possible)"),
  summary: z.string().nullable().describe("A brief 1-2 sentence summary of what this document is about"),
  keyInformation: z.record(z.string()).describe("A dictionary of key-value pairs representing the most important information extracted from the document"),
});
