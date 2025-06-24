import { Request } from 'express';

export interface TransformedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface TransformedAuthObject {
  user: TransformedUser;
}

export interface AuthenticatedRequest extends Request {
  auth: TransformedAuthObject;
}

// Extend Express Request type to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: TransformedAuthObject;
    }
  }
}

// Type guard for authenticated requests
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return !!req.auth && !!req.auth.user;
}
