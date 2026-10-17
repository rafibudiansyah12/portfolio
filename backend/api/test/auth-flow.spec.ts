import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { beforeEach, describe, it } from 'node:test';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../src/generated/prisma/client';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

type UserFixture = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
};

type RefreshFixture = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: UserFixture;
};

type TokenData = { userId: string; tokenHash: string; expiresAt: Date };
type RefreshWhere = { id?: string; tokenHash?: string };

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('AuthService auth flow', () => {
  let service: AuthService;
  let user: UserFixture;
  let tokens: RefreshFixture[];
  let prisma: PrismaService;

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = 'auth-test-secret-long-enough-for-test-cases-2026';
    user = {
      id: randomUUID(),
      name: 'Test Admin',
      email: 'admin@example.com',
      passwordHash: await argon2.hash('A-Strong-Test-Password!'),
      role: Role.ADMIN,
      createdAt: new Date(),
    };
    tokens = [];

    const updateMany = async (args: { where: RefreshWhere; data: { revokedAt: Date } }) => {
      const token = tokens.find(
        (item) =>
          (args.where.id === undefined || item.id === args.where.id) &&
          (args.where.tokenHash === undefined || item.tokenHash === args.where.tokenHash),
      );
      if (!token || token.revokedAt) return { count: 0 };
      token.revokedAt = args.data.revokedAt;
      return { count: 1 };
    };
    const createToken = async (args: { data: TokenData }) => {
      const token = { id: randomUUID(), ...args.data, revokedAt: null, user };
      tokens.push(token);
      return token;
    };
    const transaction = {
      refreshToken: {
        updateMany,
        create: createToken,
      },
    };
    const prismaMock = {
      user: { findUnique: async () => user },
      refreshToken: {
        create: createToken,
        findUnique: async (args: { where: { tokenHash: string } }) => {
          const token = tokens.find((item) => item.tokenHash === args.where.tokenHash);
          return token ? { ...token, user } : null;
        },
        updateMany,
      },
      $transaction: async <T>(callback: (tx: typeof transaction) => Promise<T>) =>
        callback(transaction),
    } as unknown as PrismaService;
    const jwtMock = {
      signAsync: async () => 'signed-access-token',
    } as unknown as JwtService;
    prisma = prismaMock;
    service = new AuthService(prisma, jwtMock);
  });

  it('logs in with a valid password and only exposes safe user fields', async () => {
    const result = await service.login(user.email, 'A-Strong-Test-Password!');
    assert.equal(result.accessToken, 'signed-access-token');
    assert.equal(result.user.email, user.email);
    assert.equal('passwordHash' in result.user, false);
    assert.equal(tokens.length, 1);
    assert.notEqual(tokens[0]?.tokenHash, result.refreshToken);
    assert.equal(tokens[0]?.tokenHash, hash(result.refreshToken));
  });

  it('rejects an incorrect password', async () => {
    await assert.rejects(service.login(user.email, 'wrong-password'), { status: 401 });
  });

  it('rotates refresh tokens and rejects replay of the previous token', async () => {
    const first = await service.login(user.email, 'A-Strong-Test-Password!');
    const next = await service.refresh(first.refreshToken);
    assert.notEqual(next.refreshToken, first.refreshToken);
    assert.equal(tokens.length, 2);
    assert.ok(tokens[0]?.revokedAt);
    await assert.rejects(service.refresh(first.refreshToken), { status: 401 });
  });

  it('revokes the refresh token on logout and returns only a public user from me', async () => {
    const session = await service.login(user.email, 'A-Strong-Test-Password!');
    await service.logout(session.refreshToken);
    assert.ok(tokens[0]?.revokedAt);
    await assert.rejects(service.refresh(session.refreshToken), { status: 401 });

    const publicUser = await service.findPublicUser(user.id);
    assert.deepEqual(publicUser, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: Role.ADMIN,
    });
    assert.equal('passwordHash' in publicUser, false);
  });
});
