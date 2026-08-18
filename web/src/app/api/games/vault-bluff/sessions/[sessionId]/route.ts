import { auth } from "@/auth";
import {
  VAULT_BLUFF_SCHEMA_UNAVAILABLE_MESSAGE,
  getGameSession,
  isVaultBluffSchemaUnavailable,
} from "@/lib/vault-bluff/service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to play Vault Bluff" } },
      { status: 401 },
    );
  }
  const { sessionId } = await context.params;
  let game: Awaited<ReturnType<typeof getGameSession>>;
  try {
    game = await getGameSession({ userId: session.user.id, sessionId });
  } catch (error) {
    if (isVaultBluffSchemaUnavailable(error)) {
      return Response.json(
        {
          error: {
            code: "GAME_SCHEMA_UNAVAILABLE",
            message: VAULT_BLUFF_SCHEMA_UNAVAILABLE_MESSAGE,
          },
        },
        { status: 503 },
      );
    }
    return Response.json(
      { error: { code: "INTERNAL_ERROR", message: "The game could not load safely" } },
      { status: 500 },
    );
  }
  if (!game) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Game session not found" } },
      { status: 404 },
    );
  }
  return Response.json(game);
}
