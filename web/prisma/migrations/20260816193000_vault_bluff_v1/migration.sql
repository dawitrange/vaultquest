-- Vault Bluff V1. Generated for review; not applied to production.

CREATE TYPE "GameSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FORFEITED');
CREATE TYPE "GamePersona" AS ENUM ('ANALYST', 'SHOWBOAT', 'NERVOUS', 'WILDCARD');
CREATE TYPE "GameRole" AS ENUM ('KEEPER', 'CHOOSER');
CREATE TYPE "GameRoundStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FORFEITED');
CREATE TYPE "GameCase" AS ENUM ('CASE_A', 'CASE_B');
CREATE TYPE "GameRewardStatus" AS ENUM ('BLOCKED', 'PENDING');

ALTER TABLE "LedgerEntry"
ADD COLUMN "gameSessionId" TEXT,
ADD COLUMN "rewardPolicyVersion" TEXT,
ADD COLUMN "fundingCampaign" TEXT;

CREATE TABLE "GameSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "GameSessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "persona" "GamePersona" NOT NULL,
  "engineVersion" TEXT NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "seed" TEXT NOT NULL,
  "rngCursor" INTEGER NOT NULL DEFAULT 0,
  "state" JSONB NOT NULL,
  "humanScore" INTEGER NOT NULL DEFAULT 0,
  "botScore" INTEGER NOT NULL DEFAULT 0,
  "xpAwarded" INTEGER NOT NULL DEFAULT 0,
  "memoryUpdatedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameRound" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "humanRole" "GameRole" NOT NULL,
  "humanCase" "GameCase" NOT NULL,
  "botCase" "GameCase" NOT NULL,
  "keyCase" "GameCase" NOT NULL,
  "status" "GameRoundStatus" NOT NULL DEFAULT 'ACTIVE',
  "publicState" JSONB NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "deadlineAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameRound_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameAction" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "roundId" TEXT,
  "clientActionId" TEXT NOT NULL,
  "expectedVersion" INTEGER NOT NULL,
  "resultingVersion" INTEGER NOT NULL,
  "kind" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BotPlayerProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "completedMatches" INTEGER NOT NULL DEFAULT 0,
  "totalXp" INTEGER NOT NULL DEFAULT 0,
  "rank" TEXT NOT NULL DEFAULT 'Scout',
  "cosmetic" TEXT NOT NULL DEFAULT 'Brass Starter Case',
  "memory" JSONB NOT NULL,
  "lastTrainedSessionId" TEXT,
  "lastEngineVersion" TEXT NOT NULL,
  "lastPolicyVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BotPlayerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameRewardGrant" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "rewardPeriod" TIMESTAMP(3) NOT NULL,
  "vp" INTEGER NOT NULL,
  "status" "GameRewardStatus" NOT NULL,
  "blockReason" TEXT,
  "rewardPolicyVersion" TEXT NOT NULL,
  "fundingCampaign" TEXT,
  "availableAt" TIMESTAMP(3),
  "ledgerEntryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameRewardGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameRound_sessionId_number_key" ON "GameRound"("sessionId", "number");
CREATE INDEX "GameRound_sessionId_status_idx" ON "GameRound"("sessionId", "status");
CREATE UNIQUE INDEX "GameAction_sessionId_clientActionId_key" ON "GameAction"("sessionId", "clientActionId");
CREATE INDEX "GameAction_sessionId_createdAt_idx" ON "GameAction"("sessionId", "createdAt");
CREATE INDEX "GameAction_roundId_idx" ON "GameAction"("roundId");
CREATE UNIQUE INDEX "BotPlayerProfile_userId_key" ON "BotPlayerProfile"("userId");
CREATE UNIQUE INDEX "BotPlayerProfile_lastTrainedSessionId_key" ON "BotPlayerProfile"("lastTrainedSessionId");
CREATE UNIQUE INDEX "GameRewardGrant_sessionId_key" ON "GameRewardGrant"("sessionId");
CREATE UNIQUE INDEX "GameRewardGrant_ledgerEntryId_key" ON "GameRewardGrant"("ledgerEntryId");
-- BLOCKED rows are attempts, not spent grants. Only a minted PENDING grant
-- consumes the user's UTC reward period.
CREATE UNIQUE INDEX "GameRewardGrant_one_pending_period_per_user_key"
ON "GameRewardGrant"("userId", "rewardPeriod")
WHERE "status" = 'PENDING';
CREATE INDEX "GameRewardGrant_userId_createdAt_idx" ON "GameRewardGrant"("userId", "createdAt");
CREATE INDEX "GameRewardGrant_userId_rewardPeriod_status_idx" ON "GameRewardGrant"("userId", "rewardPeriod", "status");
CREATE INDEX "GameRewardGrant_status_idx" ON "GameRewardGrant"("status");
CREATE INDEX "GameSession_userId_status_idx" ON "GameSession"("userId", "status");
CREATE INDEX "GameSession_userId_completedAt_idx" ON "GameSession"("userId", "completedAt");
-- PostgreSQL partial uniqueness enforces one active match per user while
-- retaining any number of completed or forfeited matches.
CREATE UNIQUE INDEX "GameSession_one_active_per_user_key"
ON "GameSession"("userId")
WHERE "status" = 'ACTIVE';
CREATE UNIQUE INDEX "LedgerEntry_gameSessionId_key" ON "LedgerEntry"("gameSessionId");

ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameAction" ADD CONSTRAINT "GameAction_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameAction" ADD CONSTRAINT "GameAction_roundId_fkey"
FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BotPlayerProfile" ADD CONSTRAINT "BotPlayerProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameRewardGrant" ADD CONSTRAINT "GameRewardGrant_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameRewardGrant" ADD CONSTRAINT "GameRewardGrant_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameRewardGrant" ADD CONSTRAINT "GameRewardGrant_ledgerEntryId_fkey"
FOREIGN KEY ("ledgerEntryId") REFERENCES "LedgerEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
