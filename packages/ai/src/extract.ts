import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { getSchemaForType, type DocumentType } from './schemas/registry';

export async function extractStructuredData(
  text: string,
  documentType: DocumentType,
) {
  const schema = getSchemaForType(documentType);

  const { object } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema,
    prompt: `You are a data extraction expert. Extract all relevant structured data from this ${documentType}.

Be precise and thorough. If a field cannot be determined from the text, use null.

Document text:
${text}`,
  });

  return object;
}
