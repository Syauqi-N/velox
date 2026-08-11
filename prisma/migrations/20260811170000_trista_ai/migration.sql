-- Add a protected system identity and generation state for TRISTA replies.
ALTER TABLE "User" ADD COLUMN "isAi" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN "aiStatus" TEXT;

CREATE INDEX "User_isAi_idx" ON "User"("isAi");

INSERT INTO "User" (
  "id",
  "email",
  "name",
  "bio",
  "memberTags",
  "role",
  "status",
  "isAi",
  "createdAt",
  "updatedAt"
)
VALUES (
  'trista-ai',
  'trista@velox.ai',
  'TRISTA',
  'Trust in Rational Investing, Strategy, Timing & Analysis. Asisten AI untuk riset dan diskusi saham Indonesia.',
  ARRAY['AI Investment Analyst', 'Saham Indonesia']::TEXT[],
  'member',
  'ACTIVE',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "bio" = EXCLUDED."bio",
  "memberTags" = EXCLUDED."memberTags",
  "status" = 'ACTIVE',
  "isAi" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
