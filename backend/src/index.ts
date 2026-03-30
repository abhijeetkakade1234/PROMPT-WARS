import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });
dotenv.config();

import apiRoutes from './routes/api';
import rateLimit from 'express-rate-limit';

function assertEnv() {
  const { DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  if (!/^postgres(ql)?:\/\//.test(DATABASE_URL)) {
    throw new Error('Invalid DATABASE_URL: must start with postgresql:// or postgres://');
  }
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const defaultAllowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const normalizeOrigin = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin.toLowerCase();
  } catch {
    return null;
  }
};

const configuredOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins.map((origin) => normalizeOrigin(origin)).filter(Boolean),
    ...configuredOrigins
  ])
) as string[];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : null;
    if (!origin || (normalizedOrigin && allowedOrigins.includes(normalizedOrigin))) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Admin-Token']
}));
app.use(express.json());

app.use('/api', apiRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

async function bootstrap() {
  try {
    assertEnv();
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`PROMPT WARS Backend running at http://localhost:${PORT}`);
    });
  } catch (error: any) {
    const message = error?.message || 'Unknown startup error';
    console.error(`[startup] Backend failed to start: ${message}`);
    process.exit(1);
  }
}

void bootstrap();

export { prisma };
