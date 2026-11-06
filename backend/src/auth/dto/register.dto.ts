import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Full legal name is required.' })
  name: string;

  @IsString()
  @IsOptional()
  memberId?: string; // Society Member ID (e.g. SOC/2024/8842 or EG/2021/8842)
}
