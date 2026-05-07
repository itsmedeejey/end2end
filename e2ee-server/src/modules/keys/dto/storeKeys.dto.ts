import {
  IsBase64,
  IsNotEmpty,
} from 'class-validator';

export class IndentityKeyDto {
  @IsBase64()
  @IsNotEmpty()
  publicKey: string;
}


