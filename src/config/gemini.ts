import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-09-2025',
});
