import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AccountType } from '../../database/types';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
