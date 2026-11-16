import express from 'express';
import http from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { LostSignalRoom } from './server/LostSignalRoom';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Setup Colyseus Game Server
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer,
    }),
  });

  // Register lost_signal room with roomCode filter
  gameServer.define('lost_signal', LostSignalRoom).filterBy(['roomCode']);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'PARTYVERSE Kayıp Sinyal Server' });
  });

  if (!isProd) {
    // Development mode: attach Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mobile builds bundle their own UI. This host serves room connections.
    app.get('/', (_req, res) => {
      res.type('html').send('<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PARTYVERSE</title><main><h1>PARTYVERSE</h1><p>Oynamak veya bir odaya katılmak için Partyverse mobil uygulamasını aç.</p></main></html>');
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[PARTYVERSE Server] Running on http://0.0.0.0:${PORT} (Production: ${isProd})`);
    console.log(`[Colyseus] Real-time WebSocket game transport ready`);
  });
}

startServer().catch((err) => {
  console.error('[PARTYVERSE Server Fatal]', err);
  process.exit(1);
});
