import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GoalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmount?: number;
}

export class UpdateGoalAmountDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentAmount: number;
}
