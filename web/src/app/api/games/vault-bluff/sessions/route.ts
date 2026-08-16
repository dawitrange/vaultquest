import { z } from "zod";
import { auth } from "@/auth";
import { PH_EVENTS, captureServerEvent } from "@/lib/posthog-server";
import { createGameSession } from "@/lib/vault-bluff/service";
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

  const result = await createGameSession({
    userId: session.user.id,
    persona: parsed.data.persona,
    rematch: parsed.data.rematch,
  });
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
