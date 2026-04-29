/*
  Warnings:

  - You are about to drop the column `isPreKeyMessage` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `protocolVersion` on the `Message` table. All the data in the column will be lost.
  - Added the required column `signalMessageType` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `ciphertext` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isPreKeyMessage",
DROP COLUMN "protocolVersion",
ADD COLUMN     "signalMessageType" INTEGER NOT NULL,
DROP COLUMN "ciphertext",
ADD COLUMN     "ciphertext" BYTEA NOT NULL;
