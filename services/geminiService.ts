import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

export const initGeminiChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `
        You are "KUBA Forge Ai", an advanced Blockchain and Smart Contract expert assistant.
        Your mission is to assist users in creating, managing, and auditing tokens on BNB, Solana, and TON networks.
        
        **CORE INSTRUCTIONS:**
        1. **LANGUAGE ADAPTABILITY:** You MUST detect the language of the user's input and respond in the SAME language. 
           - If the user asks in Thai, reply in Thai.
           - If the user asks in English, reply in English.
           - If the user asks in Chinese, reply in Chinese.
        
        2. **CAPABILITIES:**
           - Guide users through Token Creation, Liquidity Addition, Burning, Locking, and Bridging.
           - Explain error messages clearly.
           - Provide Tokenomics advice.
           - Audit Smart Contracts for security vulnerabilities.
        
        3. **CODING:**
           - If asked for code, provide Solidity (BNB), Rust/Anchor (Solana), or FunC/Tact (TON).
        
        4. **FEES:**
           - If asked about fees, mention that the platform charges a 3% Development Fee on top of network gas fees.
           
        Keep your tone professional, helpful, and technically accurate.
      `,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initGeminiChat();
  }
  if (!chatSession) {
      return "AI System is not ready. Please try again.";
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "Sorry, I could not process a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection error with AI. Please try again.";
  }
};

export const analyzeErrorWithGemini = async (errorMsg: string, context: string): Promise<string> => {
     return sendMessageToGemini(`User encountered an error: "${errorMsg}" while doing: "${context}". Please explain the cause and solution.`);
}

export const analyzeContractCode = async (code: string, chain: string, address?: string): Promise<string> => {
  return sendMessageToGemini(`
    Act as a Lead Smart Contract Security Auditor (KUBA Forge Security Bot).
    
    **Target:** ${chain} Token
    **Address:** ${address || 'Not Provided'}

    Analyze the provided Code/ABI below deeply. Do not just verify syntax; look for logic flaws, economic exploits, and centralization risks.

    **Report Requirements:**
    Provide a structured audit report in the USER'S Language (Detect from code/context, default to English). Use the following sections:

    ### 🛡️ Security & Vulnerability Analysis
    - Identify Critical, High, Medium, and Low severity issues.
    - Check for common vulnerabilities (Re-entrancy, Integer Overflow, Unchecked Return Values).
    - Check for logic flaws specific to ${chain}.

    ### ⚖️ Centralization & Governance Risks
    - Can the owner mint unlimited tokens?
    - Can the owner pause transfers, blacklist addresses, or set fees > 25%?
    - Is ownership renounceable?

    ### ✅ Best Practices & Optimization
    - Does it follow standard implementations (ERC20/BEP20/SPL/Jetton)?
    - Are there gas optimization opportunities?

    ### 📊 KUBA Audit Score: [0-100]
    - **< 50 (High Risk 🔴)**: Contains critical vulnerabilities or malicious backdoors.
    - **50-79 (Caution 🟡)**: Centralized control or minor issues found.
    - **80-100 (Safe 🟢)**: Standard implementation, secure, and decentralized.

    **Code Snippet to Audit:**
    ${code.substring(0, 12000)}
  `);
};