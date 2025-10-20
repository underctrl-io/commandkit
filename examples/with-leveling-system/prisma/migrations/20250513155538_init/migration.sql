-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messagePrefix" TEXT NOT NULL DEFAULT '!',

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Level_guildId_idx" ON "Level"("guildId");

-- CreateIndex
CREATE INDEX "Level_level_idx" ON "Level"("level");

-- CreateIndex
CREATE INDEX "Level_xp_idx" ON "Level"("xp");

-- CreateIndex
CREATE UNIQUE INDEX "Level_id_guildId_key" ON "Level"("id", "guildId");

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
