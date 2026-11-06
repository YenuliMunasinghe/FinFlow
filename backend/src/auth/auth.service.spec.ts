import {
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from './roles.decorator';

describe('AuthService', () => {
  const prisma = {
    isDbAvailable: jest.fn(),
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwtService = { sign: jest.fn() };
  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.isDbAvailable.mockReturnValue(true);
    jwtService.sign.mockReturnValue('signed-token');
    service = new AuthService(prisma as never, jwtService as never);
  });

  describe('login', () => {
    const storedUser = async (password: string) => ({
      id: 'user-1',
      email: 'president@finflow.org',
      name: 'President',
      memberId: 'EG/2021/8842',
      role: Role.PRESIDENT,
      passwordHash: await bcrypt.hash(password, 4),
    });

    it('accepts the correct password and never returns the hash', async () => {
      prisma.user.findFirst.mockResolvedValue(
        await storedUser('correct-horse'),
      );

      const result = await service.login({
        email: 'president@finflow.org',
        password: 'correct-horse',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it.each(['password', 'Password123!', 'wrong-password'])(
      'rejects %s when it is not the account password',
      async (attempt) => {
        prisma.user.findFirst.mockResolvedValue(
          await storedUser('correct-horse'),
        );

        await expect(
          service.login({ email: 'president@finflow.org', password: attempt }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(jwtService.sign).not.toHaveBeenCalled();
      },
    );

    it('does not fall back to built-in accounts for an unknown user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'admin@finflow.org', password: 'password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('reports an outage instead of issuing a token when the database fails', async () => {
      prisma.user.findFirst.mockRejectedValue(new Error('connection lost'));

      await expect(
        service.login({ email: 'admin@finflow.org', password: 'password' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'New Member',
      email: 'new@finflow.org',
      password: 'a-long-password',
      memberId: 'EG/2024/9901',
    };

    it('always creates a committee member', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: dto.email,
        role: Role.COMMITTEE_MEMBER,
      });

      // Even a role that slipped past request validation must be ignored.
      await service.register({ ...dto, role: Role.PRESIDENT } as RegisterDto);

      expect(prisma.user.create.mock.calls[0][0].data.role).toBe(
        Role.COMMITTEE_MEMBER,
      );
    });

    it('rejects a duplicate Member ID with a conflict', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('does not issue a token when the database fails', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue(new Error('connection lost'));

      await expect(service.register(dto)).rejects.toThrow('connection lost');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
