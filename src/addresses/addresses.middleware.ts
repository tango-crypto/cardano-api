import { Request, Response, NextFunction } from 'express';

export function addresses(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};