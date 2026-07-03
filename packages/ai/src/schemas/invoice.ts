import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z.string().nullable().describe("The invoice number or ID"),
  issueDate: z.string().nullable().describe("When the invoice was issued"),
  dueDate: z.string().nullable().describe("When the payment is due"),
  vendor: z.object({
    name: z.string().describe("Name of the company or person billing"),
    address: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  billTo: z.object({
    name: z.string().nullable().describe("Who the invoice is billed to"),
    address: z.string().nullable(),
  }),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().nullable(),
    unitPrice: z.number().nullable(),
    total: z.number().nullable(),
  })),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number().describe("The total amount due"),
  currency: z.string().default("USD").describe("The currency used (e.g., USD, NGN, EUR)"),
  paymentTerms: z.string().nullable(),
  keyInformation: z.array(z.object({
    key: z.string().describe("The name of the custom field (e.g., 'Matric No', 'Account ID', 'Reference')"),
    value: z.string().describe("The value of the custom field")
  })).optional().describe("Any additional custom fields found on the invoice that don't fit the standard schema"),
});
