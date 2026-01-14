
import { GoogleGenAI } from "@google/genai";

export class GeminiKernelService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async executeCode(code: string, context: string = "") {
    if (!process.env.API_KEY) {
        return "Error: API Key is missing. Ensure the environment is correctly configured.";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a Python 3.10 Interactive Kernel.
        
        SESSION HISTORY:
        ${context}
        
        EXECUTE THIS CODE:
        ${code}
        
        RULES:
        1. Act as a real Python interpreter.
        2. Maintain state from SESSION HISTORY.
        3. Output ONLY the result (stdout, stderr, or the value of the last expression).
        4. If there's an error, provide a standard Python Traceback.
        5. DO NOT provide any conversational text, greetings, or explanations.
        6. If the code produces a visualization, describe it concisely in text.`,
        config: {
          temperature: 0,
          systemInstruction: "You are a silent Python kernel. You only output execution results."
        }
      });

      return response.text || "";
    } catch (error) {
      return `Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\nRuntimeError: ${error instanceof Error ? error.message : "Kernel communication failure"}`;
    }
  }
}

export const kernel = new GeminiKernelService();
