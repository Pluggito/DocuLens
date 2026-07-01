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
});
