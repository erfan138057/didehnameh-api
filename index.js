const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'api.themoviedb.org';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const params = url.searchParams;
  params.set('api_key', TMDB_API_KEY);

  const options = {
    hostname: TMDB_BASE,
    path: `/3${path}?${params.toString()}`,
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  });

  proxyReq.end();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
