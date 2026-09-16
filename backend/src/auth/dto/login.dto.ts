import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}

