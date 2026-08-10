const BASE_URL = process.env.OPENROUTER_BASE_URL?.replace(/\/$/, "") || "https://openrouter.ai/api/v1";
const SITE_URL =
  process.env.OPENROUTER_SITE_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://vaultquest.io";
const SITE_NAME = process.env.OPENROUTER_SITE_NAME || "Vaultquest";

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
}

function getHeaders(): Record<string, string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not configured");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": SITE_URL,
    "X-Title": SITE_NAME,
  };
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const VAULT_SYSTEM_PROMPT = `You are Vault Assistant for Vaultquest — a transparent gaming rewards hub.

Rules:
- Vaultquest lets users earn Vault Points (VP, 100 VP = $1) by completing partner quests/offers, then redeem for Steam credit, keys, or giveaway entries.
- Be helpful, concise, friendly. Explain Earn -> Ledger (pending 1-3 days for verification hold) -> Redeem.
- Never promise generators, hacks, "no survey" lies, or Steam password asks. Never invent fake redemptions or guarantee amounts/times.
- If asked about earnings, give ranges and note it varies by region/offer.
- Keep answers short unless asked to elaborate. Use Vaultquest voice: clean, gamer-friendly, transparent.
`;

export async function createChatCompletion(opts: {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}): Promise<Response> {
  const model = opts.model || getOpenRouterModel();
  const messages: ChatMessage[] = [{ role: "system", content: VAULT_SYSTEM_PROMPT }, ...opts.messages];

  return fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      messages,
      stream: opts.stream ?? false,
      temperature: opts.temperature ?? 0.7,
      ...(opts.max_tokens ? { max_tokens: opts.max_tokens } : {}),
    }),
  });
}

export async function chatOnce(messages: ChatMessage[], model?: string): Promise<string> {
  const res = await createChatCompletion({ messages, model, stream: false });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 500)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
}
