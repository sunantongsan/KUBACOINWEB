import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

// Initialize the client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getCryptoNewsAndAnalysis = async (topic: string = "crypto market news"): Promise<{ text: string; sources?: any[] }> => {
  const client = getClient();
  if (!client) return { text: "API Key missing. Please check configuration." };

  try {
    // Using gemini-2.5-flash for speed with search tools
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a concise summary of the latest news and trends regarding: ${topic}. 
      Focus on price movements of major coins (BTC, ETH, KUB) and any regulatory news.
      Format with clear bullet points using Markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple queries
      },
    });

    const text = response.text || "No analysis available.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

    return { text, sources };
  } catch (error) {
    console.error("Error fetching crypto analysis:", error);
    return { text: "Failed to retrieve latest market data. Please try again later." };
  }
};

// Chat instance interface
export class CryptoChatService {
  private chat: Chat | null = null;

  constructor() {
    const client = getClient();
    if (client) {
      this.chat = client.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "You are Kubacoin AI, a helpful and knowledgeable cryptocurrency assistant. You help users understand blockchain technology, analyze market trends, and find information about coins like Bitcoin, Ethereum, and Bitkub Coin (KUB). You can use Google Search to find real-time info. Keep answers concise and helpful.",
          tools: [{ googleSearch: {} }]
        }
      });
    }
  }

  async sendMessage(message: string): Promise<{ text: string; sources?: any[] }> {
    if (!this.chat) return { text: "Chat service not initialized (missing API Key)." };

    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({ message });
      const text = response.text || "I couldn't generate a response.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];
      return { text, sources };
    } catch (error) {
      console.error("Chat error:", error);
      return { text: "Sorry, I encountered an error connecting to the network." };
    }
  }
}