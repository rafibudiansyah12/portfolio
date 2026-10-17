import { Role } from '../generated/prisma/client';
import { Request } from 'express';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface RequestWithUser extends Request {
  user?: AccessTokenPayload;
}
