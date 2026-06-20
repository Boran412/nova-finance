import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @IsNotEmpty({ message: 'Kredi adı boş bırakılamaz.' })
  name: string;

  @IsNumber({}, { message: 'Toplam tutar sayısal bir değer olmalıdır.' })
  @Min(0.01, { message: 'Toplam tutar sıfırdan büyük olmalıdır.' })
  totalAmount: number;

  @IsNumber({}, { message: 'Faiz oranı sayısal bir değer olmalıdır.' })
  @Min(0, { message: 'Faiz oranı negatif olamaz.' })
  interestRate: number; // aylık faiz oranı örn: 3.50

  @IsInt({ message: 'Vade (ay) tam sayı olmalıdır.' })
  @Min(1, { message: 'Vade en az 1 ay olmalıdır.' })
  termMonths: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsInt()
  @IsOptional()
  accountId?: number; // Kredi tutarının yatırılacağı isteğe bağlı hesap ID'si
}
