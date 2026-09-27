import { config } from '../config/env';

export interface AiChatRequest {
  prompt: string;
  queryClass?: string;
  explanationLevel?: string;
}

export interface AiChatResponse {
  answer: string | null;
  model: string;
  fallback?: boolean;
  message?: string;
}

const SYSTEM_INSTRUCTION =
  'You are the FinWise Financial Advisor. All numbers in your answer MUST come from the pre-computed deterministic context. Never perform calculations yourself. Cite retrieved sources explicitly. FORMATTING RULES: STRICTLY DO NOT USE EMOJIS. Maintain a professional, clean tone. Start with a direct 1-2 sentence overview paragraph. Use clean bullet points (- item) for figures, categories, and steps. Use bolding (**bold**) to highlight key numbers and terms. End with a concise actionable takeaway.';

export class AiService {
  /**
   * Generates financial advice using Gemini 3.8 Flash (primary) or Groq Llama-3.3 (secondary).
   */
  public static async generateAdvice(req: AiChatRequest): Promise<AiChatResponse> {
    const { prompt } = req;

    // 1. Try Groq API if configured
    console.log(
      '[AI] Groq key loaded:',
      !!config.groqApiKey,
      'length:',
      config.groqApiKey?.length
    );

    console.log(
      '[AI] Gemini key loaded:',
      !!config.geminiApiKey,
      'length:',
      config.geminiApiKey?.length
    )
    if (config.groqApiKey && config.groqApiKey !== 'MY_GROQ_API_KEY') {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.groqApiKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: SYSTEM_INSTRUCTION,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
            max_tokens: 1024,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const text = groqData.choices?.[0]?.message?.content;

          if (text) {
            console.log('[AI] Groq response successful');

            return {
              answer: text,
              model: 'Groq / GPT-OSS-120B',
            };
          }
        } else {
          const errorText = await groqResponse.text();

          console.warn(
            `[AI] Groq API returned ${groqResponse.status}: ${errorText}`
          );
        }
      } catch (err) {
        console.warn('Groq API invocation failed, trying Gemini:', err);
      }
    }

    // 2. Try Gemini 3.8 Flash via @google/genai
    if (config.geminiApiKey && config.geminiApiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        const text = response.text;
        if (text) {
          return {
            answer: text,
            model: 'Google Gemini 3.8 Flash',
          };
        }
      } catch (err) {
        console.warn('Gemini API invocation failed:', err);
      }
    }

    // 3. Fallback signal to client for deterministic offline synthesis
    return {
      answer: null,
      fallback: true,
      model: 'FinWise Deterministic Grounded Engine',
      message: 'No external LLM key active; client performs verified deterministic synthesis.',
    };
  }
}
