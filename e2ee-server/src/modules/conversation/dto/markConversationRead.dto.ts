import { IsOptional, IsString, MinLength } from 'class-validator';

export class MarkConversationReadDto {
  @IsString()
  @MinLength(1)
  conversationId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  messageId?: string;
}

