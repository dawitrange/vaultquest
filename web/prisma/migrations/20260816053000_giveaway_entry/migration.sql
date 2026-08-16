-- CreateTable
CREATE TABLE "GiveawayEntry" (
    "id" TEXT NOT NULL,
    "campaignSlug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiveawayEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiveawayEntry_campaignSlug_userId_key" ON "GiveawayEntry"("campaignSlug", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GiveawayEntry_campaignSlug_email_key" ON "GiveawayEntry"("campaignSlug", "email");

-- CreateIndex
CREATE INDEX "GiveawayEntry_campaignSlug_createdAt_idx" ON "GiveawayEntry"("campaignSlug", "createdAt");

-- AddForeignKey
ALTER TABLE "GiveawayEntry" ADD CONSTRAINT "GiveawayEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
