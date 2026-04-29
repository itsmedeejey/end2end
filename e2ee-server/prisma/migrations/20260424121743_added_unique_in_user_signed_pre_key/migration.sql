/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserSignedPreKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSignedPreKey_userId_key" ON "UserSignedPreKey"("userId");
