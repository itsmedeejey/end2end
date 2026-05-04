import {
  IsNotEmpty,
  IsString
} from 'class-validator';


export class GetKeysDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}
