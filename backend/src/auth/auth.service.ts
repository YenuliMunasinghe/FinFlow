import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './roles.decorator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email is already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already registered.');
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user in MS SQL Server
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        name: dto.name,
        memberId: dto.memberId,
        role: dto.role || Role.COMMITTEE_MEMBER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        memberId: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT Access Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    // Find user by memberId or email
    let user = null;
    if (dto.memberId) {
      user = await this.prisma.user.findFirst({
        where: { memberId: dto.memberId },
      });
    }
    if (!user && dto.email) {
      user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid Member ID or Password.');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Member ID or Password.');
    }

    // Update lastLogin timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT Access Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}
