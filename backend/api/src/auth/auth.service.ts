import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { AuthTokens, AuthUser } from '@portfolio/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants';
import { AccessTokenPayload } from './auth.types';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: AuthUser['role'];
  passwordHash: string;
};

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function publicUser(user: UserRecord): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthTokens & { refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const refreshToken = await this.createRefreshToken(user.id);
    return { ...(await this.createAccessResponse(user)), refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens & { refreshToken: string }> {
    const tokenHash = hashRefreshToken(refreshToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    const now = new Date();
    if (!existing || existing.revokedAt || existing.expiresAt <= now) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const nextRefreshToken = randomBytes(48).toString('base64url');
    await this.prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({
        where: { id: existing.id, revokedAt: null, expiresAt: { gt: now } },
        data: { revokedAt: now },
      });
      if (revoked.count !== 1) {
        throw new UnauthorizedException('Refresh token is invalid or expired.');
      }
      await transaction.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: hashRefreshToken(nextRefreshToken),
          expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        },
      });
    });

    return {
      ...(await this.createAccessResponse(existing.user)),
      refreshToken: nextRefreshToken,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createAccessResponse(user: UserRecord): Promise<AuthTokens> {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.getAccessSecret(),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: publicUser(user),
    };
  }

  async findPublicUser(id: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('User no longer exists.');
    return publicUser(user);
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashRefreshToken(token),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });
    return token;
  }

  private getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
      throw new Error('JWT_ACCESS_SECRET must be a unique secret of at least 32 characters.');
    }
    return secret;
  }
}
