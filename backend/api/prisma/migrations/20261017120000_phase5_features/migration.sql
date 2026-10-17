ALTER TABLE "subscribers"
ADD COLUMN "confirmationTokenHash" TEXT,
ADD COLUMN "confirmationExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "subscribers_confirmationTokenHash_key" ON "subscribers"("confirmationTokenHash");

CREATE TABLE "project_reactions" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "emoji" VARCHAR(16) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_reactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_reactions_projectId_emoji_key" ON "project_reactions"("projectId", "emoji");
ALTER TABLE "project_reactions" ADD CONSTRAINT "project_reactions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
