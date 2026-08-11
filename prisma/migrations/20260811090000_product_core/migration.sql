-- Product core: ticker-linked posts and the trading call lifecycle.
CREATE TYPE "CallStatus" AS ENUM ('OPEN', 'CLOSED');

ALTER TABLE "Call" ADD COLUMN "status" "CallStatus" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Call" ADD COLUMN "closedAt" TIMESTAMP(3);
DROP INDEX IF EXISTS "Call_createdAt_idx";
CREATE INDEX "Call_status_createdAt_idx" ON "Call"("status", "createdAt");

ALTER TABLE "Post" ADD COLUMN "symbol" TEXT;
CREATE INDEX "Post_symbol_createdAt_idx" ON "Post"("symbol", "createdAt");
