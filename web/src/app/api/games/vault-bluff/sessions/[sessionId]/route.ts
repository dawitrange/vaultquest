import { auth } from "@/auth";
import { getGameSession } from "@/lib/vault-bluff/service";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/games/vault-bluff/sessions/[sessionId]">,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to play Vault Bluff" } },
      { status: 401 },
    );
  }
  const { sessionId } = await context.params;
  const game = await getGameSession({ userId: session.user.id, sessionId });
  if (!game) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Game session not found" } },
      { status: 404 },
    );
  }
  return Response.json(game);
}
