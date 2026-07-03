import { z } from 'zod';

export const letterSchema = z.object({
  senderName: z.string().optional().describe('The name of the person or organization sending the letter'),
  senderAddress: z.string().optional().describe('The address of the sender'),
  recipientName: z.string().optional().describe('The name of the person or organization receiving the letter'),
  recipientAddress: z.string().optional().describe('The address of the recipient'),
  date: z.string().optional().describe('The date the letter was written or sent (YYYY-MM-DD or as written)'),
  subject: z.string().optional().describe('The subject line or regarding (Re:) text of the letter'),
  summary: z.string().describe("A brief, 1-2 sentence summary of the letter's main point"),
  keyInformation: z.array(z.object({
    key: z.string().describe("The name of the custom field"),
    value: z.string().describe("The value of the custom field")
  })).optional().describe("Any additional custom fields found in the document"),
});

export type LetterExtractedData = z.infer<typeof letterSchema>;
