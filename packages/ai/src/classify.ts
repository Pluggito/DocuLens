import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const classificationSchema = z.object({
  documentType: z.enum([
    'invoice',
    'receipt', 
    'cv',
    'contract',
    'bank_statement',
    'id_document',
    'letter',
    'generic',
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().describe('Brief explanation of why this classification was chosen'),
});

export type DocumentClassification = z.infer<typeof classificationSchema>;

export async function classifyDocument(text: string): Promise<DocumentClassification> {
  const { object } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: classificationSchema,
    prompt: `You are a document classification expert. Analyze the following text extracted from a document and determine what type of document it is.

Consider key indicators:
- Invoices: line items, totals, "invoice number", vendor/billing info
- Receipts: merchant name, transaction date, items purchased, total paid
- CVs/Resumes: personal info, work experience, education, skills
- Contracts: parties involved, terms, signatures, legal language
- Bank Statements: account number, transactions, balance
- ID Documents: name, date of birth, ID number, nationality
- Letters: salutation, body text, closing, signature

Document text:
${text}`,
  });

  return object;
}
