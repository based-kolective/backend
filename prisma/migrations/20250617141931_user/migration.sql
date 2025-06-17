-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "walletAddress" TEXT,
    "walletPrivateKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_ownerAddress_key" ON "User"("ownerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletPrivateKey_key" ON "User"("walletPrivateKey");
