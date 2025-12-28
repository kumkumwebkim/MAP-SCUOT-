import { GoogleGenAI } from "@google/genai";
import { Business } from "../types";

// Helper to sanitize JSON string if Markdown code blocks are included
const cleanJsonString = (str: string): string => {
  // Try to find JSON inside code blocks first
  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1].trim();
  }
  // If no code blocks, try to parse the whole string, removing potential markdown literals if messy
  return str.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
};

export const searchBusinesses = async (
  industry: string,
  city: string
): Promise<Business[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert Digital Scout for a high-end marketing agency.
    
    Task: Find 6-10 real local businesses in the "${industry}" industry in "${city}".
    
    Tools:
    1. Use Google Maps to verify their existence, exact location (lat/lng), and current rating.
    2. Use Google Search to briefly analyze their digital presence (website, reviews snippet).
    
    Analysis:
    For each business, identify specific marketing "gaps" or problems based on likely scenarios for this industry or search snippets.
    Look for things like: 
    - "No ChatBot" or "No AI Assistant"
    - "Manual Booking Only" (no online scheduling)
    - "Bad Recent Reviews" or "Low Rating"
    - "Outdated Website" or "Slow Mobile Site"
    - "Low Social Engagement"
    
    Output:
    Return a STRICT JSON array of objects. 
    Ensure the output is valid JSON syntax.
    Do not include any conversational text outside the JSON array.
    
    Schema:
    Array<{
      id: string (unique),
      name: string,
      address: string,
      rating: number (0 to 5),
      reviewCount: number (approximate),
      website: string (url or "N/A"),
      lat: number,
      lng: number,
      issues: string[] (1-3 identified problems),
      salesPitch: string (A punchy, 1-sentence sales pitch addressing their specific issue)
    }>
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        // Note: responseMimeType: 'application/json' is not supported when using tools in this model version.
        // We rely on the strict system instructions to get JSON.
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(cleanJsonString(text)) as Business[];
    return data;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};