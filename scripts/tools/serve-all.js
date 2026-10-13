import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to proxy requests to localhost:5173
function createProxyServer(port) {
  const server = http.createServer((req, res) => {
    // Proxy request to Vite dev server on 5173
    const options = {
      hostname: '127.0.0.1',
      port: 5173,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', () => {
      // If Vite is still warming up, redirect to 5173
      res.writeHead(302, { Location: `http://localhost:5173${req.url}` });
      res.end();
    });

    req.pipe(proxyReq, { end: true });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[Proxy] Active on http://localhost:${port} -> Forwarding to http://localhost:5173`);
  });

  server.on('error', (err) => {
    console.log(`[Proxy] Port ${port} notice: ${err.message}`);
  });
}

// Start proxy on port 3000 and 8000
createProxyServer(3000);
createProxyServer(8000);
