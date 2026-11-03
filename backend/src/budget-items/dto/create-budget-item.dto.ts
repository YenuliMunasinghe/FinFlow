import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBudgetItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required.' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'Budget item name is required.' })
  @MaxLength(150, { message: 'Budget item name cannot exceed 150 characters.' })
  itemName: string;

  @IsInt({ message: 'Quantity must be a whole number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Unit price must be a number with no more than 2 decimal places.',
    },
  )
  @Min(0.01, { message: 'Unit price must be greater than zero.' })
  unitPrice: number;
}
