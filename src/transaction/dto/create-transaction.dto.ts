import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { TransactionType } from '../../database/types';

export class CreateTransactionDto {
  @IsInt({ message: 'Hesap ID geçerli bir tam sayı olmalıdır.' })
  @IsNotEmpty({ message: 'Hesap ID boş bırakılamaz.' })
  accountId: number;

  @IsString()
  @IsNotEmpty({ message: 'Kategori boş bırakılamaz.' })
  category: string;

  @IsNumber({}, { message: 'Miktar sayısal bir değer olmalıdır.' })
  amount: number;

  @IsEnum(TransactionType, {
    message: 'Geçersiz işlem türü. INCOME, EXPENSE veya TRANSFER olmalıdır.',
  })
  type: TransactionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsInt({ message: 'Hedef hesap ID geçerli bir tam sayı olmalıdır.' })
  @IsNotEmpty({ message: 'Transfer işlemi için hedef hesap belirtilmelidir.' })
  toAccountId?: number;
}
