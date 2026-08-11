-- Expand member identity while preserving the existing single member tag.
CREATE TYPE "InvestmentStyle" AS ENUM ('VALUE', 'GROWTH', 'MOMENTUM', 'DIVIDEND', 'TRADER');

ALTER TABLE "User"
ADD COLUMN "bio" TEXT,
ADD COLUMN "memberTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "investmentStyle" "InvestmentStyle",
ADD COLUMN "favoriteSectors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "avatarData" BYTEA,
ADD COLUMN "avatarMimeType" TEXT,
ADD COLUMN "avatarName" TEXT;

UPDATE "User"
SET "memberTags" = CASE
  WHEN "memberTag" IS NULL OR BTRIM("memberTag") = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY["memberTag"]
END;

ALTER TABLE "User" DROP COLUMN "memberTag";
