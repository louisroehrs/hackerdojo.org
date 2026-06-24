// Local dev server: serves the built _site and runs api/events.js at /api/events,
// same-origin, so the events page works end-to-end without `vercel dev`.
//
//   node scripts/devserver.mjs        # → http://localhost:3001/events/
//
// Note: api/events.js is imported once at startup. After editing the function,
// restart this server. Static .html/.css changes only need `jekyll build`.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, '_site');
const PORT = process.env.PORT || 3001;

const handlerMod = await import(pathToFileURL(path.join(ROOT, 'api/events.js')).href);
const eventsHandler = handlerMod.default;

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function sendFile(res, file) {
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/events') {
    // Shim the Vercel response helpers the handler expects.
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
    res.send = (b) => { res.end(b); return res; };
    return eventsHandler(req, res);
  }

  const p = decodeURIComponent(url.pathname);
  let file = path.join(SITE, p);
  if (p.endsWith('/')) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');

  if (fs.existsSync(file)) return sendFile(res, file);
  res.statusCode = 404;
  res.end('Not found: ' + p);
});

server.listen(PORT, () => console.log(`dev server on http://localhost:${PORT}`));
