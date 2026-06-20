import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class BudgetDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  limitAmount: number;
}
