import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { getSchemaForType, type DocumentType } from './schemas/registry';

import axios from 'axios';

export async function extractStructuredData(
  text: string,
  documentType: DocumentType,
) {
  const schema = getSchemaForType(documentType);
  const prompt = `You are a data extraction expert. Extract all relevant structured data from this ${documentType}.
  
Be precise and thorough. If a field cannot be determined from the text, use null.
CRITICAL: If you see ANY key-value pairs or distinct fields in the document that do not fit into the standard schema properties (e.g. Matric No, Level, Department, Student ID, internal references, custom metadata), you MUST extract them and place them into the "keyInformation" array as key-value pairs.

Document text:
${text}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema,
      prompt,
    });
    return object;
  } catch (geminiError) {
    console.warn("Gemini failed during extraction, falling back to RapidAPI...", (geminiError as Error).message);
    
    // RapidAPI fallback
    const rapidApiKey = process.env.RAPIDAPI_KEY || "";
    if (!rapidApiKey) {
      throw new Error("Gemini failed, and RapidAPI key is missing for fallback.");
    }

    try {
      const { zodToJsonSchema } = require('zod-to-json-schema');
      const jsonSchema = zodToJsonSchema(schema, "DocumentSchema");

      const fallbackPrompt = `${prompt}
      
You MUST extract the data according to the requested document type schema.
Here is the exact JSON Schema you must follow:
${JSON.stringify(jsonSchema, null, 2)}

Return ONLY raw JSON that strictly matches the expected fields for a ${documentType}. Do NOT wrap it in markdown code blocks like \`\`\`json. Just the JSON object.`;

      const response = await axios.post("https://chatgpt-42.p.rapidapi.com/gpt4", {
        messages: [{ role: "user", content: fallbackPrompt }],
        web_access: false,
      }, {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
          "Content-Type": "application/json",
        }
      });

      let jsonString = response.data?.result || response.data?.message || response.data?.choices?.[0]?.message?.content || response.data;
      if (typeof jsonString !== 'string') {
        jsonString = JSON.stringify(jsonString);
      }
      
      jsonString = jsonString.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();

      const parsedData = JSON.parse(jsonString);
      return schema.parse(parsedData); // Ensure it matches Zod schema
    } catch (rapidApiError) {
      console.warn("Primary RapidAPI fallback failed during extraction, trying secondary fallback...", (rapidApiError as Error).message);
      
      try {
        const { zodToJsonSchema } = require('zod-to-json-schema');
        const jsonSchema = zodToJsonSchema(schema, "DocumentSchema");

        const fallbackPrompt = `${prompt}
        
You MUST extract the data according to the requested document type schema.
Here is the exact JSON Schema you must follow:
${JSON.stringify(jsonSchema, null, 2)}

Return ONLY raw JSON that strictly matches the expected fields for a ${documentType}. Do NOT wrap it in markdown code blocks like \`\`\`json. Just the JSON object.`;

        const response = await axios.post("https://chat-gpt26.p.rapidapi.com/", {
          model: 'GPT-5-mini',
          messages: [{ role: "user", content: fallbackPrompt }],
        }, {
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "chat-gpt26.p.rapidapi.com",
            "Content-Type": "application/json",
          }
        });

        let jsonString = response.data?.result || response.data?.message || response.data?.choices?.[0]?.message?.content || response.data;
        if (typeof jsonString !== 'string') {
          jsonString = JSON.stringify(jsonString);
        }
        
        jsonString = jsonString.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();

        const parsedData = JSON.parse(jsonString);
        return schema.parse(parsedData); // Ensure it matches Zod schema
      } catch (secondaryApiError) {
        console.error("Secondary RapidAPI fallback also failed:", secondaryApiError);
        throw new Error("All LLM providers failed to extract structured data.");
      }
    }
  }
}

export async function extractStructuredDataWithVision(
  fileUrl: string,
  documentType: DocumentType,
  mimeType?: string
) {
  const schema = getSchemaForType(documentType);
  const promptText = `You are a data extraction expert. Extract all relevant structured data from this ${documentType} by reading the image directly.

Be precise and thorough. If a field cannot be determined from the visual layout, use null.
CRITICAL: If you see ANY key-value pairs or distinct fields in the document that do not fit into the standard schema properties (e.g. Matric No, Level, Department, Student ID, internal references, custom metadata), you MUST extract them and place them into the "keyInformation" array as key-value pairs.`;

  try {
    let buffer: Buffer;
    if (fileUrl.startsWith('http')) {
      const response = await fetch(fileUrl);
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      const fs = require('fs');
      buffer = fs.readFileSync(fileUrl);
    }

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            { type: 'file', data: buffer, mimeType: mimeType || 'application/pdf', mediaType: mimeType || 'application/pdf' } as any
          ]
        }
      ]
    });
    return object;
  } catch (error) {
    console.warn("Vision extraction failed...", error);
    // Return null or throw. In parallel pipeline, we will catch and return null so we can fallback to OCR only.
    throw error;
  }
}
