import { Request as ExpressRequest } from 'express';
import { TransformedAuthObject } from './auth';

declare module 'express' {
  export interface Request extends ExpressRequest {
    auth?: TransformedAuthObject;
  }
}