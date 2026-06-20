import { IsNotEmpty, IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

export class FeedbackDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'Puan en az 1 olabilir.' })
  @Max(5, { message: 'Puan en fazla 5 olabilir.' })
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
