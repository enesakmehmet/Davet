import * as crypto from 'crypto';

export function generateHash(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

export function verifyHash(data: string, hash: string, secret: string): boolean {
  const computedHash = generateHash(data, secret);
  return computedHash === hash;
}

export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
