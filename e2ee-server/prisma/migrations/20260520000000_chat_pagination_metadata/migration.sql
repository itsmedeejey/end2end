-- Conversation ordering and efficient message pagination.
ALTER TABLE "Conversation"
  ADD COLUMN "lastMessageId" TEXT,
  ADD COLUMN "lastMessageAt" TIMESTAMP(3);

ALTER TABLE "ConversationMember"
  ADD COLUMN "lastReadMessageId" TEXT,
  ADD COLUMN "lastReadAt" TIMESTAMP(3);

CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");
CREATE INDEX "ConversationMember_conversationId_idx" ON "ConversationMember"("conversationId");
CREATE INDEX "Message_conversationId_id_idx" ON "Message"("conversationId", "id");

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_lastMessageId_fkey"
  FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

