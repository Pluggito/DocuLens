import { z } from "zod";

export const receiptSchema = z.object({
  merchantName: z.string().describe("The name of the store or merchant"),
  merchantAddress: z.string().nullable(),
  transactionDate: z.string().nullable(),
  transactionTime: z.string().nullable(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().nullable(),
    price: z.number().nullable(),
  })),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number().describe("The total amount paid"),
  paymentMethod: z.string().nullable().describe("How it was paid (e.g., Visa ending in 1234, Cash)"),
  currency: z.string().default("USD"),
  keyInformation: z.array(z.object({
    key: z.string().describe("The name of the custom field (e.g., 'Matric No', 'Level', 'Department', 'Receipt No')"),
    value: z.string().describe("The value of the custom field")
  })).optional().describe("Any additional custom fields found on the receipt that don't fit the standard schema"),
});
