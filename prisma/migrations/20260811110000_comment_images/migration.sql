-- Store private comment images in the existing PostgreSQL database.
ALTER TABLE "Comment" ADD COLUMN "imageData" BYTEA;
ALTER TABLE "Comment" ADD COLUMN "imageMimeType" TEXT;
ALTER TABLE "Comment" ADD COLUMN "imageName" TEXT;
