import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { UploadedImage, SiddvaultData } from '../types';

// File to Base64 helper
const fileToGenerativePart = async (file: File, mimeType: string) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: mimeType
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function analyzeVinylImages(images: UploadedImage[]): Promise<SiddvaultData> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare image parts
  const imageParts = await Promise.all(
    images.map(img => fileToGenerativePart(img.file, img.file.type))
  );

  // Add text prompt with category context
  const imageContext = images.map(img => 
    `Image of ${img.category}: ${img.file.name}`
  ).join('\n');

  const finalPrompt = `
    ${imageContext}
    
    Analyze these images based on the system instructions.
    Ensure the output is strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash for vision efficiency
      contents: {
        role: 'user',
        parts: [
            { text: finalPrompt },
            ...imageParts
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.4, // Lower temperature for factual accuracy
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini");
    }

    try {
        const data = JSON.parse(text);
        return data as SiddvaultData;
    } catch (e) {
        console.error("Failed to parse JSON", text);
        throw new Error("Gemini returned invalid JSON format.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
