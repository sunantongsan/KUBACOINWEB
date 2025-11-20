import { GoogleGenAI } from "@google/genai";

/**
 * Local AI Validator Service
 * Replaces external API calls with robust local validation logic.
 */

export interface AIAnalysisResult {
  score: number;
  issues: string[];
  recommendations: string[];
  isSafe: boolean;
}

export const analyzeTokenSafety = (
  name: string, 
  symbol: string, 
  supply: string,
  decimals: string
): AIAnalysisResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Name Analysis
  if (!name) {
    issues.push("Token name is required.");
    score -= 20;
  } else if (name.length < 3) {
    issues.push("Token name is too short (risk of impersonation).");
    score -= 10;
  } else if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    issues.push("Token name contains special characters.");
    score -= 5;
  }

  // 2. Symbol Analysis
  if (!symbol) {
    issues.push("Token symbol is required.");
    score -= 20;
  } else {
    if (symbol.length > 6) {
      issues.push("Symbol is unusually long (standard is 3-5 chars).");
      score -= 5;
    }
    if (symbol.toUpperCase() !== symbol) {
      recommendations.push("Consider using uppercase for symbol (e.g., BTC instead of btc).");
    }
  }

  // 3. Supply Analysis
  const supplyNum = parseFloat(supply.replace(/,/g, ''));
  if (!supply || isNaN(supplyNum)) {
    issues.push("Supply must be a valid number.");
    score -= 20;
  } else {
    if (supplyNum <= 0) {
      issues.push("Supply must be positive.");
      score -= 30;
    }
    if (supplyNum > 1000000000000) {
      issues.push("Extremely high supply detected (Meme coin territory).");
      recommendations.push("High supply tokens may have lower perceived value per unit.");
      score -= 5;
    }
    if (supplyNum < 1000) {
      issues.push("Supply is extremely low, which may cause liquidity issues.");
      score -= 10;
    }
  }

  // 4. Decimals Analysis
  const decNum = parseInt(decimals);
  if (isNaN(decNum) || decNum < 0 || decNum > 18) {
    issues.push("Decimals should be between 0 and 18.");
    score -= 10;
  }

  // Final Assessment
  if (score === 100) {
    recommendations.push("Token parameters look excellent and standard.");
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    isSafe: score > 70
  };
};

export const generateAIResponse = async (message: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("API_KEY is not set in process.env");
      return "I cannot connect to the AI service right now (Configuration Error).";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: 'You are KUBA AI, an intelligent assistant for the KUBA Forge platform. Help users with crypto concepts, smart contract auditing advice, and troubleshooting issues on BNB, Solana, and TON. Keep your responses concise, helpful, and safe.',
      }
    });

    return response.text || "I didn't get a response.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};