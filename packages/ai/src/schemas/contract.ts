import { z } from 'zod';

export const contractSchema = z.object({
  title: z.string().describe('The title or name of the contract'),
  effectiveDate: z.string().optional().describe('The date the contract becomes effective (YYYY-MM-DD or as written)'),
  terminationDate: z.string().optional().describe('The date the contract expires or terminates (YYYY-MM-DD or as written)'),
  parties: z.array(z.string()).describe('List of parties involved in the contract (e.g., individuals, companies)'),
  governingLaw: z.string().optional().describe('The jurisdiction or governing law mentioned in the contract'),
  keyClauses: z.array(z.string()).describe('Summary of the most important clauses or terms in the contract'),
  signatures: z.array(z.string()).optional().describe('List of names of people who have signed the contract'),
  summary: z.string().describe('A brief, 1-3 sentence summary of the contract'),
});

export type ContractExtractedData = z.infer<typeof contractSchema>;
