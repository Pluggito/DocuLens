import { z } from 'zod';
import { invoiceSchema } from './invoice';
import { receiptSchema } from './receipt';
import { cvSchema } from './cv';
import { genericSchema } from './generic';

export const schemaRegistry = {
  invoice: invoiceSchema,
  receipt: receiptSchema,
  cv: cvSchema,
  contract: genericSchema,
  bank_statement: genericSchema,
  id_document: genericSchema,
  letter: genericSchema,
  generic: genericSchema,
} as const;

export type DocumentType = keyof typeof schemaRegistry;

export function getSchemaForType(type: DocumentType) {
  return schemaRegistry[type] ?? schemaRegistry.generic;
}
