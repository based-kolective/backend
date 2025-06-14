-- DropForeignKey
ALTER TABLE "tweets" DROP CONSTRAINT "tweets_inReplyToStatusId_fkey";

-- DropForeignKey
ALTER TABLE "tweets" DROP CONSTRAINT "tweets_parentThreadId_fkey";

-- DropForeignKey
ALTER TABLE "tweets" DROP CONSTRAINT "tweets_quotedStatusId_fkey";

-- DropForeignKey
ALTER TABLE "tweets" DROP CONSTRAINT "tweets_retweetedStatusId_fkey";

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_inReplyToStatusId_fkey" FOREIGN KEY ("inReplyToStatusId") REFERENCES "tweets"("tweetId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_quotedStatusId_fkey" FOREIGN KEY ("quotedStatusId") REFERENCES "tweets"("tweetId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_retweetedStatusId_fkey" FOREIGN KEY ("retweetedStatusId") REFERENCES "tweets"("tweetId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_parentThreadId_fkey" FOREIGN KEY ("parentThreadId") REFERENCES "tweets"("tweetId") ON DELETE SET NULL ON UPDATE CASCADE;
