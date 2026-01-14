
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
        model: 'gemini-3-pro-preview', // Using pro for better reasoning in ML tasks
        contents: `You are the KNI Enterprise ML Kernel. Your job is to simulate a high-performance Python 3.10 environment.
        
        SESSION CONTEXT (Variables and state from previous cells):
        ${context}
        
        CURRENT COMMAND:
        ${code}
        
        RULES:
        1. Return ONLY what would appear in a standard Jupyter Notebook output.
        2. Format DataFrames (pandas) as rich ASCII tables or HTML-like structures.
        3. For ML models (scikit-learn/pytorch/tensorflow), show progress bars if fitting, or detailed metrics (Accuracy, F1, Loss) if evaluating.
        4. If a plot (matplotlib/seaborn) is requested, provide a detailed textual 'Visualization Summary' followed by an ASCII representation if possible.
        5. If the code has a syntax error, return a realistic Traceback.
        6. NO conversational filler. NO "Here is your output". Just the raw result.`,
        config: {
          temperature: 0.1,
          systemInstruction: "Strict Python Kernel Emulator. Context-aware, precise, and professional."
        }
      });

      return response.text || "None";
    } catch (error) {
      return `Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\nRuntimeError: ${error instanceof Error ? error.message : "KNI Cluster Interruption"}`;
    }
  }
}

export const kernel = new GeminiKernelService();