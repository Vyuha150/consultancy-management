
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeLeadIntent = async (conversation: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this conversation between an AI agent and a student. Identify:
      1. Interest Level (HOT, WARM, COLD)
      2. Preferred Country
      3. Preferred Program
      4. Key Concerns
      
      Conversation:
      ${conversation}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interestLevel: { type: Type.STRING },
            country: { type: Type.STRING },
            program: { type: Type.STRING },
            summary: { type: Type.STRING },
            urgentFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    // Use .text property directly instead of text() method.
    const responseText = response.text || "";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI intent analysis failed", error);
    return null;
  }
};

export const generateLeadResponseSuggestion = async (leadContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a helpful follow-up response suggestion for this lead. 
      Context: ${leadContext}`,
    });
    // Use .text property directly instead of text() method.
    return response.text || "Could not generate suggestion at this time.";
  } catch (error) {
    return "Could not generate suggestion at this time.";
  }
};
