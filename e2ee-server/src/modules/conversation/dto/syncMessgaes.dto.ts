import { IsNotEmpty, IsString } from 'class-validator';

export class syncMessgaesDto {
  @IsString()
  @IsNotEmpty()
  readonly conversationId: string;

  @IsString()
  @IsNotEmpty()
  readonly after: string;

}
