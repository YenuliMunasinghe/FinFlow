import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../roles.decorator';

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
  memberId?: string; // Student ID (e.g. EG/2021/8842)

  @IsEnum(Role, { message: 'Valid role must be specified (ADMIN, PRESIDENT, TREASURER, COMMITTEE_MEMBER).' })
  @IsOptional()
  role?: Role;
}
