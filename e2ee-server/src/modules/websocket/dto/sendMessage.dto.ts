import { IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @MinLength(1)
  cipherText: string;

  @IsString()
  @MinLength(1)
  nonce: string;

  @IsString()
  @MinLength(1)
  clientTempId: string;
}
