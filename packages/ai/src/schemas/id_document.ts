import { z } from 'zod';

export const idDocumentSchema = z.object({
  documentType: z.enum(['Passport', 'Driver License', 'National ID', 'Other']).describe('The type of identification document'),
  documentNumber: z.string().optional().describe('The document or ID number'),
  firstName: z.string().optional().describe('The first or given name of the person'),
  lastName: z.string().optional().describe('The last name or surname of the person'),
  dateOfBirth: z.string().optional().describe('The date of birth (YYYY-MM-DD or as written)'),
  nationality: z.string().optional().describe('The nationality or issuing country'),
  issueDate: z.string().optional().describe('The date the document was issued (YYYY-MM-DD or as written)'),
  expiryDate: z.string().optional().describe('The date the document expires (YYYY-MM-DD or as written)'),
  issuingAuthority: z.string().optional().describe('The authority or state/country that issued the document'),
  summary: z.string().describe('A brief, 1-2 sentence summary of the ID document'),
});

export type IdDocumentExtractedData = z.infer<typeof idDocumentSchema>;
