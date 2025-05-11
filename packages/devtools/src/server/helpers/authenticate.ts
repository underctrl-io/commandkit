import { sign, verify } from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

const secret = randomBytes(32).toString('hex');
const expiresIn = '7d';

export function authenticate(token: string): boolean {
  try {
    const decoded = verify(token, secret);
    return !!decoded;
  } catch (error) {
    return false;
  }
}

export function generateToken(payload: object): string {
  return sign(payload, secret, { expiresIn });
}
