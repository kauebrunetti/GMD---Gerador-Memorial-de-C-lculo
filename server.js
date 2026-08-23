// Servidor estático simples para a ferramenta (sem dependências)
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const PORTA = 4620;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let arquivo = path.join(RAIZ, url === '/' ? 'index.html' : url);
  if (!arquivo.startsWith(RAIZ)) { res.writeHead(403); res.end(); return; }
  fs.readFile(arquivo, (err, dados) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(dados);
  });
}).listen(PORTA, () => console.log('Gerador de Memorial em http://localhost:' + PORTA));
