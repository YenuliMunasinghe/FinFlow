import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Transaction title is required.' })
  title: string;

  @IsEnum(TransactionType, { message: 'Type must be either INCOME or EXPENSE.' })
  @IsNotEmpty({ message: 'Transaction type is required.' })
  type: TransactionType;

  @IsNumber({}, { message: 'Amount must be a number.' })
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Event ID is required.' })
  eventId: string;

  @IsString()
  @IsOptional()
  budgetItemId?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  overrideJustification?: string;
}
