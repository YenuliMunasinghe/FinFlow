import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Event title is required.' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Start date is required.' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string.' })
  @IsOptional()
  endDate?: string;

  @IsNumber({}, { message: 'Total budget must be a number.' })
  @Min(0, { message: 'Total budget cannot be negative.' })
  totalBudget: number;
}
