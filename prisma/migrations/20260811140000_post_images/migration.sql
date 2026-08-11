-- Allow private images and animated GIFs on feed posts.
ALTER TABLE "Post" ADD COLUMN "imageData" BYTEA;
ALTER TABLE "Post" ADD COLUMN "imageMimeType" TEXT;
ALTER TABLE "Post" ADD COLUMN "imageName" TEXT;
