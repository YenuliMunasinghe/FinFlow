import {
  Injectable,
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './roles.decorator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already registered.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          name: dto.name,
          memberId: dto.memberId,
          // Self-registration never grants elevated access.
          role: Role.COMMITTEE_MEMBER,
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

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return { user, accessToken };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'That email address or Member ID is already registered.',
        );
      }
      throw err;
    }
  }

  async login(dto: LoginDto) {
    const identifier = (dto.memberId || dto.email || '').trim();
    if (!identifier) {
      throw new UnauthorizedException(
        'Please provide your Member ID or Email.',
      );
    }

    const user = await this.findUserForLogin(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid Member ID / Email or Password.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Member ID / Email or Password.');
    }

    try {
      if (this.prisma.isDbAvailable()) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      }
    } catch {
      // Ignore DB update warning if offline
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  private async findUserForLogin(identifier: string) {
    try {
      return await this.prisma.user.findFirst({
        where: {
          OR: [
            { memberId: { equals: identifier, mode: 'insensitive' } },
            { email: { equals: identifier, mode: 'insensitive' } },
          ],
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Database query failed during login: ${message}`);
      throw new ServiceUnavailableException(
        'Sign-in is temporarily unavailable. Please try again shortly.',
      );
    }
  }
}
