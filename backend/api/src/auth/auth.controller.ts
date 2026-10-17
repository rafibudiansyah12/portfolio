import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { LoginSchema } from '@portfolio/shared';
import { Request, Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { REFRESH_COOKIE_NAME, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from './auth.validation.pipe';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './auth.types';

type RefreshCookieRequest = Request & { cookies?: Record<string, unknown> };
type GoogleCookieRequest = RefreshCookieRequest;
const GOOGLE_STATE_COOKIE = 'portfolio_google_state';
const GOOGLE_VERIFIER_COOKIE = 'portfolio_google_verifier';

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

function oauthCookieOptions(path: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path,
    maxAge: 10 * 60 * 1000,
  };
}

function clearOAuthCookies(response: Response): void {
  response.clearCookie(GOOGLE_STATE_COOKIE, oauthCookieOptions('/api/v1/auth/google'));
  response.clearCookie(GOOGLE_VERIFIER_COOKIE, oauthCookieOptions('/api/v1/auth/google'));
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

  @Get('google')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  startGoogleLogin(@Res() response: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw new ServiceUnavailableException('Google login is not configured.');
    }
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    response.cookie(GOOGLE_STATE_COOKIE, state, oauthCookieOptions('/api/v1/auth/google'));
    response.cookie(GOOGLE_VERIFIER_COOKIE, verifier, oauthCookieOptions('/api/v1/auth/google'));
    const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorization.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    response.redirect(authorization.toString());
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async googleCallback(
    @Req() request: GoogleCookieRequest,
    @Res() response: Response,
  ): Promise<void> {
    const dashboardOrigin = process.env.DASHBOARD_ORIGIN;
    if (!dashboardOrigin)
      throw new InternalServerErrorException('Dashboard origin is not configured.');
    const redirect = (result: 'success' | 'error') =>
      response.redirect(`${dashboardOrigin.replace(/\/$/, '')}/login?google=${result}`);
    const clear = () => clearOAuthCookies(response);
    try {
      const query = request.query;
      const code = typeof query.code === 'string' ? query.code : '';
      const state = typeof query.state === 'string' ? query.state : '';
      const expectedState = request.cookies?.[GOOGLE_STATE_COOKIE];
      const verifier = request.cookies?.[GOOGLE_VERIFIER_COOKIE];
      if (!code || !state || typeof expectedState !== 'string' || typeof verifier !== 'string') {
        clear();
        redirect('error');
        return;
      }
      const stateBuffer = Buffer.from(state);
      const expectedBuffer = Buffer.from(expectedState);
      if (
        stateBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(stateBuffer, expectedBuffer)
      ) {
        clear();
        redirect('error');
        return;
      }
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      if (!clientId || !clientSecret || !redirectUri) {
        clear();
        redirect('error');
        return;
      }
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code_verifier: verifier,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!tokenResponse.ok) {
        clear();
        redirect('error');
        return;
      }
      const tokenData: unknown = await tokenResponse.json();
      if (
        typeof tokenData !== 'object' ||
        tokenData === null ||
        !('access_token' in tokenData) ||
        typeof tokenData.access_token !== 'string'
      ) {
        clear();
        redirect('error');
        return;
      }
      const identityResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!identityResponse.ok) {
        clear();
        redirect('error');
        return;
      }
      const identity: unknown = await identityResponse.json();
      if (
        typeof identity !== 'object' ||
        identity === null ||
        !('email' in identity) ||
        typeof identity.email !== 'string' ||
        !('email_verified' in identity) ||
        identity.email_verified !== true
      ) {
        clear();
        redirect('error');
        return;
      }
      const session = await this.auth.loginWithGoogle(identity.email);
      setRefreshCookie(response, session.refreshToken);
      clear();
      redirect('success');
    } catch {
      clear();
      redirect('error');
    }
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
