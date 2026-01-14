
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

export class GeminiKernelService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY || '' });
  }

  async executeCode(code: string, context: string = "") {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an IPython Interactive Kernel. You are executing code for an ML researcher at KNI Organization.
        
        RULES:
        1. PERSISTENCE: Use the 'Context' provided to remember previous variable assignments.
        2. FORMATTING: If the output is a pandas DataFrame, format it as a fixed-width ASCII table. 
        3. REALISM: If the code is just an expression at the end (e.g. 'df'), show its representation.
        4. PURITY: Output ONLY what would appear in a terminal/notebook output. 
        5. LIBRARIES: Assume standard ML libraries (numpy, pandas, sklearn, torch, matplotlib) are available. If matplotlib is used, describe the resulting plot clearly.
        
        CONTEXT:
        ${context}
        
        CODE TO RUN:
        ${code}`,
        config: {
          temperature: 0, 
          systemInstruction: "You are the KNI Kernel. You act exactly like a professional Python 3 notebook environment. You never talk to the user, you only execute code and return results."
        }
      });

      return response.text?.trim() || "";
    } catch (error) {
      return `Traceback (most recent call last):\n  File "<ipython-input-1>", line 1, in <module>\nKernelError: ${error instanceof Error ? error.message : "Lost connection to KNI cluster"}`;
    }
  }
}

export const kernel = new GeminiKernelService();
