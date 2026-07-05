import { z } from 'zod';

export const bankStatementSchema = z.object({
  bankName: z.string().describe('The name of the bank or financial institution'),
  accountHolder: z.string().describe('The name of the person or entity holding the account'),
  accountNumber: z.string().optional().describe('The account number (may be partially redacted)'),
  statementPeriodStart: z.string().optional().describe('The start date of the statement period (YYYY-MM-DD)'),
  statementPeriodEnd: z.string().optional().describe('The end date of the statement period (YYYY-MM-DD)'),
  openingBalance: z.number().optional().describe('The opening or starting balance for the period'),
  closingBalance: z.number().optional().describe('The closing or ending balance for the period'),
  totalDeposits: z.number().optional().describe('The total amount of deposits or credits during the period'),
  totalWithdrawals: z.number().optional().describe('The total amount of withdrawals or debits during the period'),
  currency: z.string().optional().describe('The currency of the statement (e.g., USD, EUR, GBP)'),
  summary: z.string().describe('A brief, 1-2 sentence summary of the bank statement'),
  transactions: z.array(z.object({
    date: z.string().optional().describe('Date of the transaction (YYYY-MM-DD or as written)'),
    description: z.string().describe('Description or reference of the transaction'),
    amount: z.number().describe('Amount of the transaction (absolute value)'),
    type: z.enum(['credit', 'debit']).describe('Whether the transaction is a credit (deposit) or debit (withdrawal)'),
    balance: z.number().optional().describe('The running balance after the transaction'),
  })).optional().describe('A list of individual transactions extracted from the statement tables'),
  keyInformation: z.array(z.object({
    key: z.string().describe("The name of the custom field"),
    value: z.string().describe("The value of the custom field")
  })).optional().describe("Any additional custom fields found in the document"),
});

export type BankStatementExtractedData = z.infer<typeof bankStatementSchema>;
