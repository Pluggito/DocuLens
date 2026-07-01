import Tesseract from 'tesseract.js';
import { fromBuffer } from 'pdf2pic';

export async function extractText(fileUrl: string, mimeType?: string): Promise<string> {
  let imageToProcess: string | Buffer = fileUrl;

  // Handle PDF conversion
  if (mimeType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
    try {
      console.log('Converting PDF to image...');
      // Fetch the PDF if it's a remote URL, or read if local
      let buffer: Buffer;
      if (fileUrl.startsWith('http')) {
        const response = await fetch(fileUrl);
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        const fs = require('fs');
        buffer = fs.readFileSync(fileUrl);
      }

      // Convert first page of PDF to image
      const options = {
        density: 300,
        saveFilename: "temp",
        savePath: "/tmp",
        format: "png",
        width: 1024,
        height: 1024
      };
      
      const convert = fromBuffer(buffer, options);
      const pageToConvertAsImage = 1;
      
      const result = await convert(pageToConvertAsImage, { responseType: "buffer" }) as any;
      imageToProcess = result.buffer;
    } catch (error) {
      console.error('Failed to convert PDF, falling back to basic OCR or throwing:', error);
      throw new Error('Failed to process PDF document. Make sure Ghostscript is installed.');
    }
  }

  console.log('Running OCR via Tesseract...');
  const { data: { text, confidence } } = await Tesseract.recognize(imageToProcess, 'eng');
  
  if (confidence < 20) {
    throw new Error('OCR confidence too low — document may be unreadable or empty');
  }
  
  return text;
}
