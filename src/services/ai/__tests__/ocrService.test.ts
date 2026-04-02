import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * `vi.hoisted` returns values that are available inside `vi.mock` factories,
 * which Vitest hoists to the very top of the file (before any `const`).
 */
const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@/config/gemini', () => ({
  geminiFlash: { generateContent: mockGenerateContent },
}));

vi.mock('../prompts', () => ({
  DEED_OCR_PROMPT: 'mock-deed-prompt',
  DATA_PLATE_OCR_PROMPT: 'mock-data-plate-prompt',
  NOC_CHECK_PROMPT: 'mock-noc-prompt',
}));

import { extractDocumentData } from '../ocrService';

/**
 * Helper: build a small File object from a string payload.
 * jsdom provides a browser-like File constructor.
 */
function makeFile(content = 'fake-image-bytes', name = 'test.pdf'): File {
  return new File([content], name, { type: 'application/pdf' });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('extractDocumentData', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('extracts JSON fields from a deed document via mock Gemini response', async () => {
    const geminiJson = JSON.stringify({
      parcelId: '01-2345-678',
      grantor: 'Jane Smith',
      grantee: 'John Doe',
      legalDescription: 'Lot 1 Block 2',
      recordingInfo: 'Book 100 Page 50',
      confidence: 0.92,
    });

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => geminiJson },
    });

    const result = await extractDocumentData(makeFile(), 'deed');

    expect(result.confidence).toBe(0.92);
    expect(result.extractedFields.parcelId).toBe('01-2345-678');
    expect(result.extractedFields.grantor).toBe('Jane Smith');
    expect(result.extractedFields.grantee).toBe('John Doe');
    expect(result.extractedFields).not.toHaveProperty('confidence');
  });

  it('returns empty result with confidence 0 for unsupported document types', async () => {
    const result = await extractDocumentData(makeFile(), 'floor-plan');

    expect(result.confidence).toBe(0);
    expect(result.extractedFields).toEqual({});
    expect(result.rawText).toBe('');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('returns confidence 0 with rawText preserved when Gemini returns malformed JSON', async () => {
    const garbled = 'Extraction failed: {not: valid: json: content}';

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => garbled },
    });

    const result = await extractDocumentData(makeFile(), 'deed');

    expect(result.confidence).toBe(0);
    expect(result.rawText).toBe(garbled);
    expect(result.extractedFields).toEqual({});
  });

  it('extracts valid JSON embedded inside surrounding text', async () => {
    const responseWithWrapping = `
      Here is the extracted information:
      {"parcelId": "99-8765", "grantor": "Alice", "grantee": "Bob", "legalDescription": "Lot 9", "recordingInfo": null, "confidence": 0.88}
      End of extraction.
    `;

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => responseWithWrapping },
    });

    const result = await extractDocumentData(makeFile(), 'deed');

    expect(result.confidence).toBe(0.88);
    expect(result.extractedFields.parcelId).toBe('99-8765');
    expect(result.extractedFields.grantor).toBe('Alice');
    expect(result.extractedFields).not.toHaveProperty('confidence');
  });
});
