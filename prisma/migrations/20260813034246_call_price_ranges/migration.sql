-- Call price ranges: convert single entry/target prices into low-high ranges.
-- Preserve existing data by copying the old value into both bounds.
ALTER TABLE "Call" ADD COLUMN "entryHigh" DOUBLE PRECISION,
ADD COLUMN "entryLow" DOUBLE PRECISION,
ADD COLUMN "targetHigh" DOUBLE PRECISION,
ADD COLUMN "targetLow" DOUBLE PRECISION;

UPDATE "Call" SET "entryLow" = "entryPrice", "entryHigh" = "entryPrice" WHERE "entryPrice" IS NOT NULL;
UPDATE "Call" SET "targetLow" = "targetPrice", "targetHigh" = "targetPrice" WHERE "targetPrice" IS NOT NULL;

ALTER TABLE "Call" DROP COLUMN "entryPrice",
DROP COLUMN "targetPrice";
