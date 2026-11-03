import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Transaction title is required.' })
  @MaxLength(200, { message: 'Transaction title cannot exceed 200 characters.' })
  title: string;

  @IsEnum(TransactionType, {
    message: 'Type must be either INCOME or EXPENSE.',
  })
  @IsNotEmpty({ message: 'Transaction type is required.' })
  type: TransactionType;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with no more than 2 decimal places.' },
  )
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Event ID is required.' })
  eventId: string;

  /** Required for EXPENSE, not allowed for INCOME (enforced in the service). */
  @IsString()
  @IsOptional()
  budgetItemId?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  /** Required when the expense would exceed its budget item or event budget. */
  @IsString()
  @MaxLength(1000, {
    message: 'Override justification cannot exceed 1000 characters.',
  })
  @IsOptional()
  overrideJustification?: string;
}
