/*
  Warnings:

  - You are about to drop the column `isPreKeyMessage` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `protocolVersion` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `registrationId` on the `UserIdentityKey` table. All the data in the column will be lost.
  - You are about to drop the `UserOneTimePreKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSignedPreKey` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nonce` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserOneTimePreKey" DROP CONSTRAINT "UserOneTimePreKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSignedPreKey" DROP CONSTRAINT "UserSignedPreKey_userId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isPreKeyMessage",
DROP COLUMN "protocolVersion",
ADD COLUMN     "nonce" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserIdentityKey" DROP COLUMN "registrationId";

-- DropTable
DROP TABLE "UserOneTimePreKey";

-- DropTable
DROP TABLE "UserSignedPreKey";
