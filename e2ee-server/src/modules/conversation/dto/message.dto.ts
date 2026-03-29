import { IsNotEmpty, IsString } from 'class-validator';

export class messageDto {
  @IsString()
  @IsNotEmpty()
  readonly conversationId: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

}
