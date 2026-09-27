import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './server/config/env';
import { apiRouter } from './server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = config.port;

  // Global Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API Sub-System
  app.use('/api', apiRouter);

  // Frontend Integration (Vite Middleware in Dev / Static Dist in Prod)
  if (config.nodeEnv !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinWise] Server initialized on port ${PORT} (${config.nodeEnv})`);
  });
}

startServer().catch((err) => {
  console.error('[FinWise] Server initialization failed:', err);
  process.exit(1);
});
