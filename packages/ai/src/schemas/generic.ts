import { z } from "zod";

export const genericSchema = z.object({
  title: z.string().nullable().describe("The main title or heading of the document"),
  date: z.string().nullable().describe("The date mentioned in the document (YYYY-MM-DD format if possible)"),
  summary: z.string().nullable().describe("A brief 1-2 sentence summary of what this document is about"),
  entities: z.array(z.object({
    name: z.string(),
    type: z.string().describe("e.g. Person, Organization, Location"),
  })).optional(),
  keyInformation: z.array(z.object({
    key: z.string().describe("The name of the custom field (e.g. Matric No, Programme, Origin)"),
    value: z.string().describe("The value of the custom field")
  })).optional().describe("Any key-value pairs or metadata found in the document"),
});
