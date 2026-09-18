import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised environment configuration.
 * Values fall back to sensible development defaults when not provided.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nicecards',
  jwtSecret: process.env.JWT_SECRET || 'change_this_to_a_long_random_secret_string',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@nicecards.com',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Cloudflare R2 (S3-compatible) storage for product images. When these are
  // left empty the app falls back to storing base64 data URIs in MongoDB.
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.R2_BUCKET || '',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};

export default config;
