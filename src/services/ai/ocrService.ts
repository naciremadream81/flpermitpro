import { geminiFlash } from '@/config/gemini';
import { DEED_OCR_PROMPT, DATA_PLATE_OCR_PROMPT, NOC_CHECK_PROMPT } from './prompts';
import type { OcrResult, DocumentType } from '@/types';

const PROMPT_MAP: Partial<Record<DocumentType, string>> = {
  'deed': DEED_OCR_PROMPT,
  'data-plate': DATA_PLATE_OCR_PROMPT,
  'noc': NOC_CHECK_PROMPT,
};

export async function extractDocumentData(
  file: File,
  documentType: DocumentType,
): Promise<OcrResult> {
  const prompt = PROMPT_MAP[documentType];
  if (!prompt) {
    return { extractedFields: {}, confidence: 0, rawText: '' };
  }

  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
  );

  const result = await geminiFlash.generateContent([
    { inlineData: { mimeType: file.type, data: base64 } },
    prompt,
  ]);

  const responseText = result.response.text();

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Pull the confidence score Gemini included in the JSON, then
    // strip it from the extracted fields so downstream consumers
    // only see actual document data.
    const { confidence: rawConfidence, ...extractedFields } = parsed;
    const geminiConfidence =
      typeof rawConfidence === 'number'
        ? Math.max(0, Math.min(1, rawConfidence))
        : 0.5; // Default to 0.5 (uncertain) when Gemini omits the field

    return {
      extractedFields,
      confidence: geminiConfidence,
      rawText: responseText,
    };
  } catch {
    return {
      extractedFields: {},
      confidence: 0,
      rawText: responseText,
    };
  }
}
