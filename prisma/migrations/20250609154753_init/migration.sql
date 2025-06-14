-- CreateTable
CREATE TABLE "tweets" (
    "id" TEXT NOT NULL,
    "bookmarkCount" INTEGER,
    "conversationId" TEXT,
    "hashtags" TEXT[],
    "html" TEXT,
    "isQuoted" BOOLEAN DEFAULT false,
    "isPin" BOOLEAN DEFAULT false,
    "isReply" BOOLEAN DEFAULT false,
    "isRetweet" BOOLEAN DEFAULT false,
    "isSelfThread" BOOLEAN DEFAULT false,
    "likes" INTEGER,
    "name" TEXT,
    "permanentUrl" TEXT,
    "replies" INTEGER,
    "retweets" INTEGER,
    "text" TEXT,
    "timeParsed" TIMESTAMP(3),
    "timestamp" BIGINT,
    "urls" TEXT[],
    "userId" TEXT,
    "username" TEXT,
    "views" INTEGER,
    "sensitiveContent" BOOLEAN DEFAULT false,
    "inReplyToStatusId" TEXT,
    "quotedStatusId" TEXT,
    "retweetedStatusId" TEXT,
    "parentThreadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "tweetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "tweetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "url" TEXT,
    "tweetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "placeId" TEXT,
    "placeType" TEXT,
    "name" TEXT,
    "fullName" TEXT,
    "countryCode" TEXT,
    "country" TEXT,
    "boundingBox" JSONB,
    "tweetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "pollId" TEXT,
    "endDatetime" TEXT,
    "votingStatus" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "tweetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" TEXT NOT NULL,
    "position" INTEGER,
    "label" TEXT NOT NULL,
    "votes" INTEGER,
    "pollId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "places_tweetId_key" ON "places"("tweetId");

-- CreateIndex
CREATE UNIQUE INDEX "polls_tweetId_key" ON "polls"("tweetId");

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_inReplyToStatusId_fkey" FOREIGN KEY ("inReplyToStatusId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_quotedStatusId_fkey" FOREIGN KEY ("quotedStatusId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_retweetedStatusId_fkey" FOREIGN KEY ("retweetedStatusId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_parentThreadId_fkey" FOREIGN KEY ("parentThreadId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
