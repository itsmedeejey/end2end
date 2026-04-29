import {
  IsInt,
  IsArray,
  ValidateNested,
  IsBase64,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SignedPreKeyDto {
  @IsInt()
  keyId: number;

  @IsBase64()
  @IsNotEmpty()
  publicKey: string;

  @IsBase64()
  @Length(80, 120)
  signature: string;
}

export class PreKeyDto {
  @IsInt()
  keyId: number;

  @IsBase64()
  @IsNotEmpty()
  publicKey: string;
}

export class KeyBundleDto {
  @IsBase64()
  @IsNotEmpty()
  identityKey: string;

  @IsInt()
  registrationId: number;

  @ValidateNested()
  @Type(() => SignedPreKeyDto)
  signedPreKey: SignedPreKeyDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PreKeyDto)
  preKeys: PreKeyDto[];
}
