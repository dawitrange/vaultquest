import { z } from "zod";
import { auth } from "@/auth";
import { PH_EVENTS, captureServerEvent } from "@/lib/posthog-server";
import {
  GameServiceError,
  createGameSession,
} from "@/lib/vault-bluff/service";
import { PERSONA_IDS } from "@/lib/vault-bluff/types";

const createSchema = z.object({
  persona: z.enum(PERSONA_IDS).optional(),
  rematch: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to play Vault Bluff" } },
      { status: 401 },
    );
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "INVALID_REQUEST", message: "Choose a valid bot persona" } },
      { status: 400 },
    );
  }

  let result: Awaited<ReturnType<typeof createGameSession>>;
  try {
    result = await createGameSession({
      userId: session.user.id,
      persona: parsed.data.persona,
      rematch: parsed.data.rematch,
    });
  } catch (error) {
    if (error instanceof GameServiceError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.code === "NOT_FOUND" ? 404 : 409 },
      );
    }
    return Response.json(
      { error: { code: "INTERNAL_ERROR", message: "The match could not open safely" } },
      { status: 500 },
    );
  }
  await Promise.all([
    captureServerEvent(
      session.user.id,
      parsed.data.rematch
        ? PH_EVENTS.vault_bluff_rematch_started
        : PH_EVENTS.vault_bluff_started,
      {
        engine_version: result.session.engineVersion,
        policy_version: result.session.policyVersion,
        persona: result.session.persona,
        rematch: parsed.data.rematch,
      },
    ),
    parsed.data.persona
      ? captureServerEvent(session.user.id, PH_EVENTS.vault_bluff_persona_selected, {
          persona: parsed.data.persona,
          policy_version: result.session.policyVersion,
        })
      : Promise.resolve(),
  ]);
  return Response.json(result, { status: 201 });
}
