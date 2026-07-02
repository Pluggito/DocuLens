import Tesseract from 'tesseract.js';
import { fromBuffer } from 'pdf2pic';
const pdfParse = require('pdf-parse');

export async function extractText(fileUrl: string, mimeType?: string): Promise<string> {
  let imageToProcess: string | Buffer = fileUrl;

  // Handle PDF extraction
  if (mimeType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
    let buffer: Buffer;
    try {
      console.log('Fetching PDF...');
      if (fileUrl.startsWith('http')) {
        const response = await fetch(fileUrl);
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        const fs = require('fs');
        buffer = fs.readFileSync(fileUrl);
      }
    } catch (error) {
      console.error('Failed to read PDF:', error);
      throw new Error('Failed to read PDF file.');
    }

    try {
      console.log('Attempting native text extraction via pdf-parse...');
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length > 50) {
        // Native text extracted successfully
        return data.text;
      }
      console.log('PDF has no embedded text (likely a scanned image). Falling back to OCR...');
    } catch (error) {
      console.log('pdf-parse failed, falling back to OCR...', error);
    }

    // Fallback to OCR for scanned PDFs
    try {
      console.log('Converting scanned PDF to image via pdf2pic (requires Ghostscript)...');
      const options = {
        density: 300,
        saveFilename: "temp",
        savePath: "/tmp",
        format: "png",
        width: 1024,
        height: 1024
      };
      
      const convert = fromBuffer(buffer, options);
      const result = await convert(1, { responseType: "base64" }) as any;
      imageToProcess = `data:image/png;base64,${result.base64}`;
    } catch (error) {
      console.error('Failed to convert PDF to image for OCR:', error);
      throw new Error('Failed to convert scanned PDF. Ensure Ghostscript is installed.');
    }
  }

  console.log('Running OCR via Tesseract...');
  const { data: { text, confidence } } = await Tesseract.recognize(imageToProcess, 'eng');
  
  if (confidence < 20) {
    throw new Error('OCR confidence too low — document may be unreadable or empty');
  }
  
  return text;
}
