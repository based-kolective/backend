/*
  Warnings:

  - A unique constraint covering the columns `[tweetId]` on the table `tweets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tweets" ADD COLUMN     "tweetId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tweets_tweetId_key" ON "tweets"("tweetId");
