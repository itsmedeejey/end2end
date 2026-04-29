import { IsString, IsUUID, MinLength, IsIn, IsBase64, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsBase64()
  @MinLength(1)
  @MaxLength(20000)
  cipherText: string;

  @IsIn([1, 3])
  messageType: 1 | 3;

  @IsString()
  @MinLength(1)
  clientTempId: string;
}
