import { randomUUID } from "node:crypto";
import {
  GameRewardStatus,
  GameRoundStatus,
  GameSessionStatus,
  Prisma,
  type GameRewardGrant,
  type GamePersona,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  applyCommand,
  closeMatchForRematch,
  startMatch,
  toSafeSessionDto,
} from "./engine";
import { neutralPlayerMemory, updatePlayerMemoryOnce } from "./player-memory";
import {
  canFulfillVaultBluffPromo,
  grantGamePromoInTransaction,
  type GameRewardResult,
} from "./rewards";
import {
  PERSONA_IDS,
  VAULT_BLUFF_ENGINE_VERSION,
  VAULT_BLUFF_POLICY_VERSION,
  type PersonaId,
  type PlayerMemory,
  type SafeSessionDto,
  type VaultBluffCommand,
  type VaultBluffState,
} from "./types";

type SessionResult = {
  id: string;
  version: number;
  session: SafeSessionDto;
  reward: GameRewardResult | null;
};

export const VAULT_BLUFF_SCHEMA_UNAVAILABLE_MESSAGE =
  "Vault Bluff is not available in this preview. Connect the isolated QA database and apply the committed migration there.";

export function isVaultBluffSchemaErrorCode(code: string): boolean {
  return code === "P2021" || code === "P2022";
}

export function isVaultBluffSchemaUnavailable(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    isVaultBluffSchemaErrorCode(error.code)
  );
}

export type RematchSessionPlan = {
  closeSessionId: string | null;
  returnSessionId: string | null;
};

export function planRematchSession(
  activeSessionIds: readonly string[],
  replaceSessionId: string | undefined,
): RematchSessionPlan {
  if (activeSessionIds.length === 0) {
    return { closeSessionId: null, returnSessionId: null };
  }
  if (!replaceSessionId || !activeSessionIds.includes(replaceSessionId)) {
    return { closeSessionId: null, returnSessionId: activeSessionIds[0] ?? null };
  }
  return {
    closeSessionId: replaceSessionId,
    returnSessionId:
      activeSessionIds.find((sessionId) => sessionId !== replaceSessionId) ?? null,
  };
}

export function rewardResultFromGrant(
  grant:
    | Pick<
        GameRewardGrant,
        "status" | "vp" | "availableAt" | "blockReason"
      >
    | null
    | undefined,
): GameRewardResult | null {
  if (!grant) return null;
  if (grant.status === GameRewardStatus.PENDING && grant.availableAt) {
    return { kind: "granted", vp: grant.vp, availableAt: grant.availableAt };
  }
  return { kind: "blocked", reason: grant.blockReason ?? "not_eligible" };
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function parseState(value: Prisma.JsonValue): VaultBluffState {
  return value as unknown as VaultBluffState;
}

function parseMemory(value: Prisma.JsonValue): PlayerMemory {
  const candidate = value as unknown;
  if (
    candidate &&
    typeof candidate === "object" &&
    "completedMatches" in candidate &&
    typeof candidate.completedMatches === "number"
  ) {
    return candidate as PlayerMemory;
  }
  return neutralPlayerMemory();
}

function rankFor(totalXp: number): { rank: string; cosmetic: string } {
  if (totalXp >= 2_000) return { rank: "Vaultmind", cosmetic: "Teal Cipher Case" };
  if (totalXp >= 800) return { rank: "Keykeeper", cosmetic: "Steel Signal Case" };
  if (totalXp >= 250) return { rank: "Bluffer", cosmetic: "Brass Tell Case" };
  return { rank: "Scout", cosmetic: "Brass Starter Case" };
}

function randomPersona(seed: string): PersonaId {
  let total = 0;
  for (const char of seed) total += char.charCodeAt(0);
  return PERSONA_IDS[total % PERSONA_IDS.length]!;
}

async function ensureProfile(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<{ memory: PlayerMemory; totalXp: number }> {
  const existing = await tx.botPlayerProfile.findUnique({ where: { userId } });
  if (existing) {
    return { memory: parseMemory(existing.memory), totalXp: existing.totalXp };
  }
  const memory = neutralPlayerMemory();
  await tx.botPlayerProfile.create({
    data: {
      userId,
      memory: jsonValue(memory),
      lastEngineVersion: VAULT_BLUFF_ENGINE_VERSION,
      lastPolicyVersion: VAULT_BLUFF_POLICY_VERSION,
    },
  });
  return { memory, totalXp: 0 };
}

export async function createGameSession(args: {
  userId: string;
  persona?: PersonaId;
  rematch?: boolean;
  replaceSessionId?: string;
}): Promise<SessionResult> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await createGameSessionAttempt(args);
    } catch (error) {
      if (
        error instanceof GameServiceError &&
        error.code === "VERSION_CONFLICT" &&
        attempt < 2
      ) {
        continue;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2002" || error.code === "P2034") &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new GameServiceError("VERSION_CONFLICT", "A match is already being opened");
}

async function createGameSessionAttempt(args: {
  userId: string;
  persona?: PersonaId;
  rematch?: boolean;
  replaceSessionId?: string;
}): Promise<SessionResult> {
  return prisma.$transaction(
    async (tx) => {
      const activeSessions = await tx.gameSession.findMany({
        where: { userId: args.userId, status: GameSessionStatus.ACTIVE },
        orderBy: { updatedAt: "desc" },
      });
      const active = activeSessions[0];
      if (!args.rematch && active) {
        return {
          id: active.id,
          version: active.version,
          session: toSafeSessionDto(parseState(active.state)),
          reward: null,
        };
      }
      if (args.rematch) {
        const plan = planRematchSession(
          activeSessions.map((session) => session.id),
          args.replaceSessionId,
        );
        const closedAt = new Date();
        const sessionToClose = activeSessions.find(
          (session) => session.id === plan.closeSessionId,
        );
        if (sessionToClose) {
          await closeActiveSessionForRematch(tx, sessionToClose, closedAt);
        }
        const sessionToReturn = activeSessions.find(
          (session) => session.id === plan.returnSessionId,
        );
        if (sessionToReturn) {
          return {
            id: sessionToReturn.id,
            version: sessionToReturn.version,
            session: toSafeSessionDto(parseState(sessionToReturn.state)),
            reward: null,
          };
        }
      }

      await ensureProfile(tx, args.userId);
      const seed = randomUUID();
      const persona = args.persona ?? randomPersona(seed);
      const now = new Date();
      const state = startMatch({ seed, persona, now: now.toISOString() });
      const safe = toSafeSessionDto(state);
      const session = await tx.gameSession.create({
        data: {
          userId: args.userId,
          persona: persona as GamePersona,
          engineVersion: state.engineVersion,
          policyVersion: state.policyVersion,
          seed,
          rngCursor: state.rngCursor,
          state: jsonValue(state),
          humanScore: 0,
          botScore: 0,
          rounds: {
            create: {
              number: 1,
              humanRole: state.rounds[0]!.humanRole,
              humanCase: state.rounds[0]!.humanCase,
              botCase: state.rounds[0]!.botCase,
              keyCase: state.rounds[0]!.keyCase,
              publicState: jsonValue(safe.currentRound),
              startedAt: now,
              deadlineAt: new Date(state.rounds[0]!.deadlineAt),
            },
          },
        },
      });
      return { id: session.id, version: session.version, session: safe, reward: null };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

async function closeActiveSessionForRematch(
  tx: Prisma.TransactionClient,
  session: {
    id: string;
    version: number;
    state: Prisma.JsonValue;
  },
  closedAt: Date,
): Promise<void> {
  const before = parseState(session.state);
  const closed = closeMatchForRematch(before, closedAt.toISOString());
  const safe = toSafeSessionDto(closed);
  const currentRound = closed.rounds.at(-1);
  if (!currentRound) throw new GameServiceError("NOT_FOUND", "Active round not found");

  const status = closed.forfeited
    ? GameSessionStatus.FORFEITED
    : GameSessionStatus.COMPLETED;
  const updated = await tx.gameSession.updateMany({
    where: {
      id: session.id,
      status: GameSessionStatus.ACTIVE,
      version: session.version,
    },
    data: {
      status,
      version: session.version + 1,
      state: jsonValue(closed),
      rngCursor: closed.rngCursor,
      humanScore: closed.humanScore,
      botScore: closed.botScore,
      xpAwarded: closed.xpAwarded,
      completedAt: closedAt,
    },
  });
  if (updated.count !== 1) {
    throw new GameServiceError("VERSION_CONFLICT", "Active match changed during rematch");
  }

  const round = await tx.gameRound.findUnique({
    where: {
      sessionId_number: {
        sessionId: session.id,
        number: currentRound.number,
      },
    },
  });
  if (!round) throw new GameServiceError("NOT_FOUND", "Active round not found");
  await tx.gameRound.update({
    where: { id: round.id },
    data: {
      status: closed.forfeited
        ? GameRoundStatus.FORFEITED
        : GameRoundStatus.COMPLETED,
      publicState: jsonValue(safe.currentRound),
      completedAt: closedAt,
    },
  });
  await tx.gameAction.create({
    data: {
      sessionId: session.id,
      roundId: round.id,
      clientActionId: `rematch-${randomUUID()}`,
      expectedVersion: session.version,
      resultingVersion: session.version + 1,
      kind: "REMATCH_CLOSE",
      payload: jsonValue({ reason: "rematch", closedAt: closedAt.toISOString() }),
    },
  });
}

export async function getGameSession(args: {
  userId: string;
  sessionId: string;
}): Promise<SessionResult | null> {
  const session = await prisma.gameSession.findFirst({
    where: { id: args.sessionId, userId: args.userId },
    include: { rewardGrant: true },
  });
  if (!session) return null;
  return {
    id: session.id,
    version: session.version,
    session: toSafeSessionDto(parseState(session.state)),
    reward: rewardResultFromGrant(session.rewardGrant),
  };
}

async function applyActionAttempt(args: {
  userId: string;
  sessionId: string;
  expectedVersion: number;
  clientActionId: string;
  command: VaultBluffCommand;
}): Promise<SessionResult> {
  return prisma.$transaction(
    async (tx) => {
      const session = await tx.gameSession.findFirst({
        where: { id: args.sessionId, userId: args.userId },
        include: { rewardGrant: true },
      });
      if (!session) throw new GameServiceError("NOT_FOUND", "Game session not found");

      const duplicate = await tx.gameAction.findUnique({
        where: {
          sessionId_clientActionId: {
            sessionId: args.sessionId,
            clientActionId: args.clientActionId,
          },
        },
      });
      if (duplicate) {
        return {
          id: session.id,
          version: session.version,
          session: toSafeSessionDto(parseState(session.state)),
          reward: rewardResultFromGrant(session.rewardGrant),
        };
      }
      if (session.version !== args.expectedVersion) {
        throw new GameServiceError("VERSION_CONFLICT", "Session changed. Refresh and try again");
      }

      const profile = await ensureProfile(tx, args.userId);
      const before = parseState(session.state);
      const after = applyCommand(before, args.command, profile.memory);
      const nextVersion = session.version + 1;
      const updated = await tx.gameSession.updateMany({
        where: { id: session.id, userId: args.userId, version: args.expectedVersion },
        data: {
          version: nextVersion,
          status: after.completed
            ? after.forfeited
              ? GameSessionStatus.FORFEITED
              : GameSessionStatus.COMPLETED
            : GameSessionStatus.ACTIVE,
          rngCursor: after.rngCursor,
          state: jsonValue(after),
          humanScore: after.humanScore,
          botScore: after.botScore,
          xpAwarded: after.xpAwarded,
          completedAt: after.completed ? new Date(args.command.now) : null,
        },
      });
      if (updated.count !== 1) {
        throw new GameServiceError("VERSION_CONFLICT", "Session changed. Refresh and try again");
      }

      const beforeRound = before.rounds.at(-1)!;
      const afterRound = after.rounds.at(-1)!;
      const persistedRound = await tx.gameRound.findUnique({
        where: {
          sessionId_number: { sessionId: session.id, number: beforeRound.number },
        },
      });
      if (!persistedRound) throw new GameServiceError("NOT_FOUND", "Round not found");
      const safe = toSafeSessionDto(after);
      const safeBeforeRound = safe.rounds.find((round) => round.number === beforeRound.number)!;
      const updatedBeforeRound = after.rounds.find(
        (round) => round.number === beforeRound.number,
      )!;
      await tx.gameRound.update({
        where: { id: persistedRound.id },
        data: {
          status: updatedBeforeRound.resolvedAt
            ? GameRoundStatus.COMPLETED
            : after.forfeited
              ? GameRoundStatus.FORFEITED
              : GameRoundStatus.ACTIVE,
          publicState: jsonValue(safeBeforeRound),
          completedAt: updatedBeforeRound.resolvedAt
            ? new Date(updatedBeforeRound.resolvedAt)
            : null,
        },
      });
      if (afterRound.number !== beforeRound.number) {
        await tx.gameRound.create({
          data: {
            sessionId: session.id,
            number: afterRound.number,
            humanRole: afterRound.humanRole,
            humanCase: afterRound.humanCase,
            botCase: afterRound.botCase,
            keyCase: afterRound.keyCase,
            publicState: jsonValue(safe.currentRound),
            startedAt: new Date(afterRound.startedAt),
            deadlineAt: new Date(afterRound.deadlineAt),
          },
        });
      }

      await tx.gameAction.create({
        data: {
          sessionId: session.id,
          roundId: persistedRound.id,
          clientActionId: args.clientActionId,
          expectedVersion: args.expectedVersion,
          resultingVersion: nextVersion,
          kind: args.command.kind,
          payload: jsonValue(args.command),
        },
      });

      let reward: GameRewardResult | null = null;
      if (after.completed && !after.forfeited) {
        const trainedMemory = updatePlayerMemoryOnce(profile.memory, after);
        const totalXp = profile.totalXp + after.xpAwarded;
        const progress = rankFor(totalXp);
        const profileUpdate = await tx.botPlayerProfile.updateMany({
          where: {
            userId: args.userId,
            OR: [
              { lastTrainedSessionId: null },
              { lastTrainedSessionId: { not: session.id } },
            ],
          },
          data: {
            completedMatches: { increment: 1 },
            totalXp,
            rank: progress.rank,
            cosmetic: progress.cosmetic,
            memory: jsonValue(trainedMemory),
            lastTrainedSessionId: session.id,
            lastEngineVersion: after.engineVersion,
            lastPolicyVersion: after.policyVersion,
          },
        });
        if (profileUpdate.count === 1) {
          await tx.gameSession.update({
            where: { id: session.id },
            data: { memoryUpdatedAt: new Date(args.command.now) },
          });
          reward = await grantGamePromoInTransaction({
            tx,
            userId: args.userId,
            sessionId: session.id,
            now: new Date(args.command.now),
          });
        }
      }

      return { id: session.id, version: nextVersion, session: safe, reward };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function applyGameAction(
  args: Parameters<typeof applyActionAttempt>[0],
): Promise<SessionResult> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await applyActionAttempt(args);
    } catch (error) {
      if (error instanceof GameServiceError && error.code === "VERSION_CONFLICT") {
        const duplicate = await prisma.gameAction.findUnique({
          where: {
            sessionId_clientActionId: {
              sessionId: args.sessionId,
              clientActionId: args.clientActionId,
            },
          },
        });
        if (duplicate) {
          const current = await getGameSession({
            userId: args.userId,
            sessionId: args.sessionId,
          });
          if (current) return current;
        }
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2002" || error.code === "P2034") &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new GameServiceError("VERSION_CONFLICT", "Session changed. Refresh and try again");
}

export async function getPlayProgress(userId: string) {
  try {
    const [profile, completedMatches, rewards] = await Promise.all([
      prisma.botPlayerProfile.findUnique({ where: { userId } }),
      prisma.gameSession.count({
        where: { userId, status: GameSessionStatus.COMPLETED },
      }),
      prisma.gameRewardGrant.findMany({
        where: { userId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { vp: true, status: true, rewardPeriod: true },
      }),
    ]);
    return {
      schemaReady: true as const,
      completedMatches,
      totalXp: profile?.totalXp ?? 0,
      rank: profile?.rank ?? "Scout",
      cosmetic: profile?.cosmetic ?? "Brass Starter Case",
      promoVp30Days: rewards
        .filter((reward) => reward.status === "PENDING")
        .reduce((total, reward) => total + reward.vp, 0),
      rewardedToday: rewards.some(
        (reward) =>
          reward.status === GameRewardStatus.PENDING &&
          reward.rewardPeriod.getTime() === new Date().setUTCHours(0, 0, 0, 0),
      ),
      rewardsEnabled: canFulfillVaultBluffPromo(),
    };
  } catch (error) {
    if (!isVaultBluffSchemaUnavailable(error)) throw error;
    return {
      schemaReady: false as const,
      completedMatches: 0,
      totalXp: 0,
      rank: "Unavailable",
      cosmetic: "Unavailable",
      promoVp30Days: 0,
      rewardedToday: false,
      rewardsEnabled: false,
    };
  }
}

export class GameServiceError extends Error {
  constructor(
    readonly code: "NOT_FOUND" | "VERSION_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "GameServiceError";
  }
}
