import { IsNotEmpty, IsString } from 'class-validator';

export class ToDto {
  @IsString()
  @IsNotEmpty()
  readonly to: string;
}
