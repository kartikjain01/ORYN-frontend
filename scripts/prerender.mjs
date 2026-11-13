import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

const ROUTES = [
  '/',
  '/register',
  '/privacy',
  '/terms',
  '/cookies',
  '/about',
  // Tool landing pages
  '/voice-clone',
  '/text-to-speech',
  '/voice-editor',
  '/caption-generation',
  // Blog
  '/blog',
  '/blog/ai-voice-cloning-guide',
  '/blog/text-to-speech-creators',
  '/blog/ai-captions-video',
  '/blog/ai-voice-editor-guide',
  '/blog/how-ai-voice-cloning-works',
  '/blog/best-free-tts-tools-2026',
  '/blog/ai-audio-enhancement-guide',
  '/blog/start-podcast-with-ai-tools',
  '/blog/voice-cloning-ethics-legal-guide',
  '/blog/ai-tools-for-youtubers-2026',
];

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp3': 'audio/mpeg',
};

function serve(dir) {
  return new Promise((res) => {
    const server = createServer((req, resp) => {
      const url = req.url.split('?')[0];
      const ext = url.includes('.') ? '.' + url.split('.').pop() : '';
      let file = join(dir, url);

      if (!ext || !existsSync(file)) {
        file = join(dir, 'index.html');
      }

      try {
        const data = readFileSync(file);
        resp.writeHead(200, { 'Content-Type': mime[ext] || 'text/html' });
        resp.end(data);
      } catch {
        resp.writeHead(404);
        resp.end('Not found');
      }
    });
    server.listen(0, () => res(server));
  });
}

async function prerender() {
  console.log(`Starting prerender for ${ROUTES.length} routes...`);
  const server = await serve(DIST);
  const port = server.address().port;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();

    try {
      await page.goto(`http://localhost:${port}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 20000,
      });

      await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));

      const html = await page.content();

      const outDir = join(DIST, route === '/' ? '' : route);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html);
      console.log(`  ✓ ${route}`);
      success++;
    } catch (err) {
      console.warn(`  ✗ ${route}: ${err.message}`);
      failed++;
    }

    await page.close();
  }

  await browser.close();
  server.close();
  console.log(`\nPrerender complete: ${success} succeeded, ${failed} failed`);
}

prerender().catch(console.error);
