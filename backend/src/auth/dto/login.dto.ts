import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Member ID is required.' })
  memberId: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}

