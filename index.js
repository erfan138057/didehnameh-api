const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

function proxyRequest(hostname, path, res) {
  const options = {
    hostname,
    path,
    method: 'GET',
    headers: { 'Accept': '*/*', 'User-Agent': 'Mozilla/5.0' }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const contentType = proxyRes.headers['content-type'] || 'application/octet-stream';
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  });

  proxyReq.end();
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // پروکسی عکس — مثال: /img/w185/vtv3Vmog437YHCgswk3zSI9Hwiz.jpg
  if (pathname.startsWith('/img/')) {
    const imagePath = pathname.substring(4); // حذف /img و نگه داشتن /w185/xxx.jpg
    proxyRequest('image.tmdb.org', `/t/p${imagePath}`, res);
    return;
  }

  // پروکسی API
  const params = url.searchParams;
  params.set('api_key', TMDB_API_KEY);
  proxyRequest('api.themoviedb.org', `/3${pathname}?${params.toString()}`, res);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
