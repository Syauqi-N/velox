-- Preserve the market context shown when a ticker-linked post is created.
ALTER TABLE "Post" ADD COLUMN "priceSnapshot" DOUBLE PRECISION;
ALTER TABLE "Post" ADD COLUMN "changePercentSnapshot" DOUBLE PRECISION;
ALTER TABLE "Post" ADD COLUMN "priceCapturedAt" TIMESTAMP(3);
