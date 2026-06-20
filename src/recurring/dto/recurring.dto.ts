import { IsNotEmpty, IsNumber, IsOptional, IsString, IsIn, Min } from 'class-validator';

export class RecurringDto {
  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsIn(['INCOME', 'EXPENSE'])
  type: 'INCOME' | 'EXPENSE';

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsIn(['WEEKLY', 'MONTHLY', 'YEARLY'])
  interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @IsNotEmpty()
  @IsString()
  nextExecutionDate: string;
}
