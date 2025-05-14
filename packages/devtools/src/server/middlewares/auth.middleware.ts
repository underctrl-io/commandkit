import { NextFunction, Request, Response } from 'express';
import { authenticate } from '../helpers/authenticate';
import { getClient, getConfig } from '../store';

export function auth() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!getConfig().credential) {
      return next();
    }

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return void res.status(401).json({ message: 'Unauthorized' });
    }

    const auth = authenticate(token);

    if (!auth) {
      return void res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  };
}
