import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createChatCompletion, getOpenRouterModel, isOpenRouterConfigured, type ChatMessage } from "@/lib/openrouter";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_INPUT_CHARS = 3000;

const RATE: Map<string, number[]> = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_MIN = 12;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (RATE.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  RATE.set(key, arr);
  return arr.length > MAX_PER_MIN;
}

function errorJson(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  if (!isOpenRouterConfigured()) {
    return errorJson("AI not configured — set OPENROUTER_API_KEY on server.", 503);
  }

  const session = await auth();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const key = session?.user?.id || ip;
  if (rateLimited(key)) {
    return errorJson("Too many messages — slow down a moment.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson("Invalid JSON body.", 400);
  }

  const parsed = body as {
    messages?: ChatMessage[];
    stream?: boolean;
    model?: string;
  };

  let messages = parsed.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return errorJson("messages[] required.", 400);
  }
  messages = messages.slice(-MAX_MESSAGES);
  for (const m of messages) {
    if (!m || typeof m.content !== "string" || !["user", "assistant", "system"].includes(m.role)) {
      return errorJson("Invalid message shape.", 400);
    }
    if (m.content.length > MAX_INPUT_CHARS) {
      return errorJson(`Message too long (max ${MAX_INPUT_CHARS} chars).`, 400);
    }
  }

  const wantsStream = parsed.stream !== false;

  try {
    const upstream = await createChatCompletion({
      messages,
      model: parsed.model || getOpenRouterModel(),
      stream: wantsStream,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[chat] upstream", upstream.status, text.slice(0, 800));
      const hint =
        upstream.status === 401
          ? "OpenRouter key invalid or missing."
          : upstream.status === 402
            ? "OpenRouter credits exhausted."
            : `Upstream ${upstream.status}`;
      return errorJson(`${hint}`, upstream.status === 429 ? 429 : 502);
    }

    if (!wantsStream || !upstream.body) {
      const json = await upstream.json();
      const content: string =
        json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? "";
      return new Response(JSON.stringify({ content, model: json?.model }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream proxy — forward SSE frames as-is
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    (async () => {
      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Re-emit line-by-line to keep SSE framing intact
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            await writer.write(encoder.encode(line + "\n"));
          }
        }
        if (buffer) await writer.write(encoder.encode(buffer));
      } catch (e) {
        console.error("[chat] stream proxy error", e);
      } finally {
        try {
          await writer.close();
        } catch {}
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("[chat]", e);
    return errorJson("Chat failed — try again.", 500);
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      configured: isOpenRouterConfigured(),
      model: getOpenRouterModel(),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}
