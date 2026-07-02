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

Document text:
${text}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
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
