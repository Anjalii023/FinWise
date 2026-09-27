import { Router } from 'express';
import { authRouter } from './authRoutes';
import { analyticsRouter } from './analyticsRoutes';
import { ragRouter } from './ragRoutes';
import { statementRouter } from './statementRoutes';
import { chatRouter } from './chatRoutes';
import { config } from '../config/env';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FinWise Financial Intelligence Server',
    environment: config.nodeEnv,
    hasGeminiKey: Boolean(config.geminiApiKey),
    hasGroqKey: Boolean(config.groqApiKey),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/', analyticsRouter);
apiRouter.use('/rag', ragRouter);
apiRouter.use('/', statementRouter);
apiRouter.use('/chat', chatRouter);
