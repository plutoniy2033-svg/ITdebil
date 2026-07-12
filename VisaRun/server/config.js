import 'dotenv/config';

const DEV_JWT_SECRET = 'visarun-dev-secret-change-me';

export const config = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
};

export function validateConfig() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required. Copy .env.example to .env and set PostgreSQL URL.');
  }

  if (config.isProduction && config.jwtSecret === DEV_JWT_SECRET) {
    throw new Error('JWT_SECRET must be set to a strong value in production.');
  }
}
