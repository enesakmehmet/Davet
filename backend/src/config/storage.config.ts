import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  type: process.env.STORAGE_TYPE || 'local', // local, s3, r2
  local: {
    uploadPath: process.env.LOCAL_UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'eu-central-1',
    bucket: process.env.AWS_S3_BUCKET || '',
  },
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    bucket: process.env.CLOUDFLARE_R2_BUCKET || '',
  },
}));
