import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginSchema } from '@portfolio/shared';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { REFRESH_COOKIE_NAME, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from './auth.validation.pipe';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './auth.types';

type RefreshCookieRequest = Request & { cookies?: Record<string, unknown> };

function refreshCookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? ('none' as const) : ('lax' as const),
    path: '/api/v1/auth',
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  };
}

function clearRefreshCookie(response: Response): void {
  const options = refreshCookieOptions();
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}

function setRefreshCookie(response: Response, token: string): void {
  response.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
}

function publicSession(session: Awaited<ReturnType<AuthService['login']>>) {
  return {
    accessToken: session.accessToken,
    tokenType: session.tokenType,
    expiresIn: session.expiresIn,
    user: session.user,
  };
}

function assertTrustedOrigin(request: Request): void {
  const origin = request.get('origin');
  if (!origin) return;

  const trustedOrigins = [process.env.WEB_ORIGIN, process.env.DASHBOARD_ORIGIN].filter(
    (value): value is string => Boolean(value),
  );
  if (!trustedOrigins.includes(origin)) {
    throw new ForbiddenException('Origin is not allowed.');
  }
}

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', format: 'password' },
      },
    },
  })
  async login(
    @Req() request: Request,
    @Body(new ZodValidationPipe(LoginSchema)) body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    assertTrustedOrigin(request);
    const session = await this.auth.login(body.email, body.password);
    setRefreshCookie(response, session.refreshToken);
    return publicSession(session);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: RefreshCookieRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    assertTrustedOrigin(request);
    const token = request.cookies?.[REFRESH_COOKIE_NAME];
    if (typeof token !== 'string') {
      throw new UnauthorizedException('Refresh token cookie is missing.');
    }
    const session = await this.auth.refresh(token);
    setRefreshCookie(response, session.refreshToken);
    return publicSession(session);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: RefreshCookieRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    assertTrustedOrigin(request);
    const token = request.cookies?.[REFRESH_COOKIE_NAME];
    await this.auth.logout(typeof token === 'string' ? token : undefined);
    clearRefreshCookie(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@Req() request: RequestWithUser) {
    if (!request.user) throw new UnauthorizedException('A valid access token is required.');
    return this.auth.findPublicUser(request.user.sub);
  }
}
