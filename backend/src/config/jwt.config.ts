import { registerAs } from '@nestjs/config';
import { getJwtSecret } from './secret.util';

export default registerAs('jwt', () => ({
  secret: getJwtSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || getJwtSecret(),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
