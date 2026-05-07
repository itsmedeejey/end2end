import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class getKeysDto {

  @IsString()
  @IsNotEmpty()
  receiverId: string;
}
