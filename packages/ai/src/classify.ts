import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const classificationSchema = z.object({
  documentType: z.enum([
    'invoice',
    'receipt', 
    'cv',
    'contract',
    'bank_statement',
    'id_document',
    'letter',
    'generic',
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().describe('Brief explanation of why this classification was chosen'),
});

export type DocumentClassification = z.infer<typeof classificationSchema>;

import axios from 'axios';

export async function classifyDocument(text: string): Promise<DocumentClassification> {
  const prompt = `You are a document classification expert. Analyze the following text extracted from a document and determine what type of document it is.

Consider key indicators:
- Invoices: line items, totals, "invoice number", vendor/billing info
- Receipts: merchant name, transaction date, items purchased, total paid
- CVs/Resumes: personal info, work experience, education, skills
- Contracts: parties involved, terms, signatures, legal language
- Bank Statements: account number, transactions, balance
- ID Documents: name, date of birth, ID number, nationality
- Letters: salutation, body text, closing, signature

Document text:
${text}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: classificationSchema,
      prompt,
    });
    return object;
  } catch (geminiError) {
    console.warn("Gemini failed during classification, falling back to RapidAPI...", (geminiError as Error).message);
    
    // RapidAPI fallback
    const rapidApiKey = process.env.RAPIDAPI_KEY || "";
    if (!rapidApiKey) {
      throw new Error("Gemini failed, and RapidAPI key is missing for fallback.");
    }

    try {
      // Append JSON instructions to the prompt since we aren't using generateObject
      const fallbackPrompt = `${prompt}
      
You MUST return ONLY a valid JSON object with EXACTLY these two fields:
- "documentType": A string which MUST be exactly one of: "invoice", "receipt", "cv", "contract", "bank_statement", "id_document", "letter", or "generic".
- "confidence": A number between 0 and 1.
- "reasoning": A brief explanation of why this classification was chosen.
Return raw JSON. Do NOT wrap it in markdown code blocks like \`\`\`json. Just the JSON object.`;

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
        jsonString = JSON.stringify(jsonString); // Best effort if it returns parsed JSON oddly
      }
      
      // Strip potential markdown code blocks
      jsonString = jsonString.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();

      const parsedData = JSON.parse(jsonString);
      return classificationSchema.parse(parsedData);
    } catch (rapidApiError) {
      console.warn("Primary RapidAPI fallback failed, trying secondary fallback...", (rapidApiError as Error).message);
      
      try {
        const fallbackPrompt = `${prompt}
      
You MUST return ONLY a valid JSON object with EXACTLY these two fields:
- "documentType": A string which MUST be exactly one of: "invoice", "receipt", "cv", "contract", "bank_statement", "id_document", "letter", or "generic".
- "confidence": A number between 0 and 1.
- "reasoning": A brief explanation of why this classification was chosen.
Return raw JSON. Do NOT wrap it in markdown code blocks like \`\`\`json. Just the JSON object.`;

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
        return classificationSchema.parse(parsedData);
      } catch (secondaryApiError) {
        console.error("Secondary RapidAPI fallback also failed:", secondaryApiError);
        throw new Error("All LLM providers failed to classify document.");
      }
    }
  }
}
