import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const root = rootPath.endsWith(sep) ? rootPath.slice(0, -1) : rootPath;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

function addHeaderRemoval(rule, line) {
  const name = line.slice(1).trim().toLowerCase();
  if (name) rule.remove.push(name);
}

function addHeaderValue(rule, line) {
  const colon = line.indexOf(':');
  if (colon === -1) return;
  const name = line.slice(0, colon).trim();
  const value = line.slice(colon + 1).trim();
  if (name && value) rule.headers[name] = value;
}

function parseHeaderRules(source) {
  const rules = [];
  let current = null;
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (!/^\s/.test(rawLine)) {
      current = { pattern: line, headers: {}, remove: [] };
      rules.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('!')) addHeaderRemoval(current, line);
    else addHeaderValue(current, rawLine);
  }
  return rules;
}

export async function loadHeaderRules() {
  try {
    return parseHeaderRules(await readFile(join(root, '_headers'), 'utf8'));
  } catch (error) {
    console.warn('Kodingu dev: _headers could not be read.', error.message);
    return [];
  }
}

export function matchesPattern(pattern, pathname) {
  if (pattern === '/*') return true;
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, String.raw`\$&`)
    .replaceAll('*', '.*');
  return new RegExp(`^${source}$`).test(pathname);
}

// Cloudflare Pages combines repeated headers from every matching rule with a
// comma instead of letting the last rule win.
export function collectHeaders(rules, pathname) {
  const merged = new Map();
  for (const rule of rules) {
    if (!matchesPattern(rule.pattern, pathname)) continue;
    for (const name of rule.remove || []) merged.delete(name);
    for (const [name, value] of Object.entries(rule.headers)) {
      const key = name.toLowerCase();
      const entry = merged.get(key);
      if (entry) entry.values.push(value);
      else merged.set(key, { name, values: [value] });
    }
  }
  return Object.fromEntries(
    [...merged.values()].map(({ name, values }) => [name, values.join(', ')])
  );
}

function insideRoot(pathname) {
  const target = normalize(join(root, decodeURIComponent(pathname)));
  if (target !== root && !target.startsWith(root + sep)) return null;
  return target;
}

async function isFile(path) {
  return stat(path).then((info) => info.isFile()).catch(() => false);
}

async function resolveFile(pathname) {
  if (pathname.endsWith('/')) {
    const index = join(insideRoot(pathname) || root, 'index.html');
    return (await isFile(index)) ? index : null;
  }
  const direct = insideRoot(pathname);
  if (!direct) return null;
  if (await isFile(direct)) return direct;
  // Cloudflare Pages serves /lesson for lesson.html.
  if (!extname(direct)) {
    const html = `${direct}.html`;
    if (await isFile(html)) return html;
  }
  return null;
}

export async function startServer({ port = 4173, host = '127.0.0.1' } = {}) {
  const rules = await loadHeaderRules();

  const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const headers = collectHeaders(rules, url.pathname);

    const file = await resolveFile(pathname);
    if (!file) {
      const notFound = join(root, '404.html');
      const body = await readFile(notFound).catch(() => 'Not found');
      response.writeHead(404, { 'Content-Type': TYPES['.html'], ...headers });
      response.end(request.method === 'HEAD' ? undefined : body);
      return;
    }

    try {
      const body = await readFile(file);
      response.writeHead(200, {
        'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
        ...headers
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`Kodingu dev: ${error.message}`);
    }
  });

  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(port, host, accept);
  });

  const actual = server.address().port;
  return {
    server,
    port: actual,
    url: `http://${host}:${actual}`,
    close: () => new Promise((done) => server.close(done))
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const port = Number(process.env.PORT) || 4173;
  const host = process.env.HOST || '127.0.0.1';
  const { url } = await startServer({ port, host });
  console.log(`Kodingu dev server on ${url}`);
  console.log('Serving _headers (CSP and security headers) and extensionless URLs.');
}
