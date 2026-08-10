-- Member features: approval/entry-code onboarding, posts, comments, per-user watchlist

-- 1) User lifecycle status
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE');

ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
UPDATE "User" SET "status" = 'ACTIVE' WHERE "passwordHash" IS NOT NULL;
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;

-- 2) Entry code (replaces the old invite-token mechanism)
ALTER TABLE "User" ADD COLUMN "entryCodeHash" TEXT;
ALTER TABLE "User" ADD COLUMN "entryCodeExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "User_entryCodeHash_key" ON "User"("entryCodeHash");

DROP INDEX IF EXISTS "User_inviteTokenHash_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "inviteExpiresAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "inviteTokenHash";

-- 3) Posts (member feed)
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- 4) Comments on posts
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- 5) Per-user watchlist
CREATE TABLE "WatchlistEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE UNIQUE INDEX "WatchlistEntry_userId_symbol_key" ON "WatchlistEntry"("userId", "symbol");
CREATE INDEX "WatchlistEntry_userId_idx" ON "WatchlistEntry"("userId");

ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
