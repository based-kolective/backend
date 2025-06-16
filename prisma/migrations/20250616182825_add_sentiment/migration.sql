-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('BULLISH', 'BEARISH', 'NEUTRAL');

-- AlterTable
ALTER TABLE "coins" ADD COLUMN     "sentiment" "Sentiment";
