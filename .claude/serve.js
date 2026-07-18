const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/Arquivos e Programas/Obsidian/pokepoke_site';
const TYPES = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.json':'application/json', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  // Endpoint de gravação: POST /save?path=assets/icon/x.png  (body = base64 do PNG)
  if (req.method === 'POST' && req.url.startsWith('/save')) {
    const rel = decodeURIComponent((req.url.split('path=')[1] || '').split('&')[0]);
    const dest = path.join(ROOT, rel);
    if (!dest.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end('forbidden'); }
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.from(body, 'base64'));
        res.writeHead(200); res.end('ok ' + rel);
      } catch (e) { res.writeHead(500); res.end('err ' + e.message); }
    });
    return;
  }
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(8753, () => console.log('serving on 8753'));
