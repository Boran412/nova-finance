import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType } from '../../database/types';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Hesap adı boş olamaz.' })
  name: string;

  @IsEnum(AccountType, {
    message: 'Geçersiz hesap türü. CASH, BANK, CRYPTO veya STOCK olmalıdır.',
  })
  type: AccountType;

  @IsNumber({}, { message: 'Bakiye sayısal bir değer olmalıdır.' })
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
