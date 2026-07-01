import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import previewRoutes from './routes/previewRoutes.js';

import { rateLimit } from './middlewares/rateLimit.js';

export default function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '50mb' }));
  app.use(rateLimit);
  app.use(express.static(path.join(root, 'dist', 'client')));
  app.use('/uploads', express.static(path.join(root, 'uploads')));

  app.use('/api', authRoutes);
  app.use('/api', roomRoutes);
  app.use('/api', messageRoutes);
  app.use('/api', previewRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}
