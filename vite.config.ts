import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite dev-server API handler plugin so "npm run dev" serves /api/* without Express
function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vite-plugin-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(url, 'http://localhost');
        const pathname = parsedUrl.pathname.replace(/^\/api\//, ''); // e.g. "auth/login" or "services"
        
        // Match route to api/*.ts file
        const candidatePaths = [
          path.resolve(__dirname, `api/${pathname}.ts`),
          path.resolve(__dirname, `api/${pathname}/index.ts`),
        ];

        let modulePath: string | null = null;
        for (const p of candidatePaths) {
          try {
            const fs = await import('fs');
            if (fs.existsSync(p)) {
              modulePath = p;
              break;
            }
          } catch {}
        }

        if (!modulePath) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: `API route /api/${pathname} not found` } }));
          return;
        }

        try {
          // Use Vite's ssrLoadModule to execute TypeScript handler directly with HMR
          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod.default || mod.handler;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: { code: 'HANDLER_ERROR', message: 'No default export handler found' } }));
          }
        } catch (err: any) {
          console.error(`Error executing API route /api/${pathname}:`, err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: err?.message || 'Server error' } }));
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@api': path.resolve(__dirname, './api'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
