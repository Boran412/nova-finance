import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class PayLoanDto {
  @IsInt({ message: 'Ödeme yapılacak hesap ID tam sayı olmalıdır.' })
  @IsNotEmpty({ message: 'Ödeme yapılacak hesap belirtilmelidir.' })
  accountId: number;

  @IsNumber({}, { message: 'Ödeme miktarı sayısal bir değer olmalıdır.' })
  @Min(0.01, { message: 'Ödeme miktarı sıfırdan büyük olmalıdır.' })
  @IsOptional()
  amount?: number; // Belirtilmezse varsayılan aylık taksit tutarı ödenir
}
