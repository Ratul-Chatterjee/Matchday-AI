const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const MODEL_MAP: Record<string, string> = {
  'gemini-2.0-flash': 'llama-3.3-70b-versatile',
  'gemini-1.5-flash': 'llama3-8b-8192',
};

function mapModel(model: string): string {
  return MODEL_MAP[model] || model || 'llama-3.3-70b-versatile';
}

interface GenerateOptions {
  model: string;
  contents: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  config?: { system_instruction?: string };
}

async function generateContent(options: GenerateOptions): Promise<{ text: string }> {
  const messages: Array<{ role: string; content: string }> = [];
  const systemMsg = options.systemInstruction || options.config?.system_instruction;
  if (systemMsg) {
    messages.push({ role: 'system', content: systemMsg });
  }
  messages.push({ role: 'user', content: options.contents });

  const actualModel = mapModel(options.model);

  const resp = await fetch(GROQ_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: actualModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxOutputTokens || 2048,
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error('Groq API error ' + resp.status + ': ' + errBody);
  }

  const data = await resp.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
  };
}

export const groqClient = {
  models: { generateContent },
};
