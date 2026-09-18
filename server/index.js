import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import connectDB from './config/db.js';
import sanitizeMiddleware from './utils/sanitize.js';
import errorHandler from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { ensureAdmin } from './middleware/admin.js';

const app = express();

// ---- Security headers ----
app.use(helmet());

// ---- CORS ----
const allowedOrigins = (config.clientUrl || '*').split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

// ---- Request logging ----
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// ---- Body parsing ----
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ---- NoSQL injection sanitization ----
app.use(sanitizeMiddleware);

// ---- API routes ----
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', customerRoutes);
app.use('/api', categoryRoutes);
app.use('/api', dashboardRoutes);

// ---- Health check ----
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Nice Cards API is running', env: config.env });
});

// ---- Serve built frontend (production) ----
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client/dist');

if (config.env === 'production' && fs.existsSync(clientDist)) {
  // Static assets (JS/CSS/images) from the Vite build
  app.use(express.static(clientDist));

  // SPA fallback: any non-API GET returns index.html so React Router can render
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ---- Central error handler ----
app.use(errorHandler);

// ---- Start server ----
const start = async () => {
  await connectDB();
  await ensureAdmin();
  app.listen(config.port, () => {
    console.log(`Nice Cards API running in ${config.env} mode on port ${config.port}`);
  });
};

start();
