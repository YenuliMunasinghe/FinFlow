import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateBudgetItemDto } from '../../budget-items/dto/create-budget-item.dto';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Event title is required.' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(200, { message: 'Venue cannot exceed 200 characters.' })
  @IsOptional()
  venue?: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Start date is required.' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string.' })
  @IsOptional()
  endDate?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Total budget must be a number with no more than 2 decimal places.',
    },
  )
  @Min(0, { message: 'Total budget cannot be negative.' })
  totalBudget: number;

  /**
   * Optional initial budget plan. Items are persisted atomically with the
   * event; more can be added later via /events/:eventId/budget-items.
   */
  @IsArray()
  @ArrayMaxSize(100, { message: 'An event can have at most 100 budget items.' })
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  @IsOptional()
  budgetItems?: CreateBudgetItemDto[];
}
