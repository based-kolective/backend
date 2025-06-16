-- CreateTable
CREATE TABLE "coins" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "contractAddress" TEXT NOT NULL,
    "marketCap" TEXT,
    "chain" TEXT,
    "decimals" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoinTweets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoinTweets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CoinTweets_B_index" ON "_CoinTweets"("B");

-- AddForeignKey
ALTER TABLE "_CoinTweets" ADD CONSTRAINT "_CoinTweets_A_fkey" FOREIGN KEY ("A") REFERENCES "coins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoinTweets" ADD CONSTRAINT "_CoinTweets_B_fkey" FOREIGN KEY ("B") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
