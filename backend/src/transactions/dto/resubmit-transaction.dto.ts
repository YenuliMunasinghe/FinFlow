import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Fields a submitter may change when answering a revision request.
 * Type and event are fixed once a transaction has been submitted.
 */
export class ResubmitTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Transaction title cannot be empty.' })
  @MaxLength(200, { message: 'Transaction title cannot exceed 200 characters.' })
  @IsOptional()
  title?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with no more than 2 decimal places.' },
  )
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  @IsOptional()
  amount?: number;

  @IsString()
  @IsNotEmpty({ message: 'Budget item ID cannot be empty.' })
  @IsOptional()
  budgetItemId?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @MaxLength(1000, {
    message: 'Override justification cannot exceed 1000 characters.',
  })
  @IsOptional()
  overrideJustification?: string;
}
