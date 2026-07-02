import { z } from 'zod';
import { invoiceSchema } from './invoice';
import { receiptSchema } from './receipt';
import { cvSchema } from './cv';
import { contractSchema } from './contract';
import { bankStatementSchema } from './bank_statement';
import { idDocumentSchema } from './id_document';
import { letterSchema } from './letter';
import { genericSchema } from './generic';

export const schemaRegistry = {
  invoice: invoiceSchema,
  receipt: receiptSchema,
  cv: cvSchema,
  contract: contractSchema,
  bank_statement: bankStatementSchema,
  id_document: idDocumentSchema,
  letter: letterSchema,
  generic: genericSchema,
} as const;

export type DocumentType = keyof typeof schemaRegistry;

export function getSchemaForType(type: DocumentType) {
  return schemaRegistry[type] ?? schemaRegistry.generic;
}
