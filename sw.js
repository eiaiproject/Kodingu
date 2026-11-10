const CACHE = 'kodingu-v19';

const SHELL = [
  'index.html',
  'catalog.html',
  'course.html',
  'lesson.html',
  'practice.html',
  'challenge.html',
  'projects.html',
  'project.html',
  'progress.html',
  'certificate.html',
  'offline.html',
  '404.html',
  'favicon.svg',
  'assets/css/base.css',
  'assets/css/fonts.css',
  'assets/css/app.css',
  'assets/css/static.css',
  'assets/fonts/ibm-plex-mono-400.woff2',
  'assets/fonts/ibm-plex-mono-500.woff2',
  'assets/fonts/public-sans.woff2',
  'assets/fonts/shippori-mincho-500.woff2',
  'assets/fonts/shippori-mincho-600.woff2',
  'assets/js/core/app.js',
  'assets/js/core/chrome.js',
  'assets/js/core/html.js',
  'assets/js/core/preview.js',
  'assets/js/core/seo.js',
  'assets/js/core/storage.js',
  'assets/js/pages/catalog.js',
  'assets/js/pages/certificate.js',
  'assets/js/pages/challenge.js',
  'assets/js/pages/course.js',
  'assets/js/data/course-index.js',
  'assets/js/data/data-challenges.js',
  'assets/js/data/data-helpers.js',
  'assets/js/data/data-projects.js',
  'assets/js/pages/home.js',
  'assets/js/core/icons.js',
  'assets/js/editor/js-runner.js',
  'assets/js/editor/preflight-frame.js',
  'assets/js/editor/preflight-worker.js',
  'assets/js/pages/lesson.js',
  'assets/js/pages/not-found.js',
  'assets/js/pages/practice.js',
  'assets/js/pages/progress.js',
  'assets/js/pages/project.js',
  'assets/js/pages/projects.js',
  'assets/js/editor/runner-frame.js',
  'assets/js/core/theme-init.js',
  'assets/js/editor/workspace.js'
];

async function openCache() {
  try {
    return await caches.open(CACHE);
  } catch (error) {
    console.warn('Kodingu: the offline cache is unavailable.', error);
    return null;
  }
}

async function matchCache(cache, request) {
  if (!cache) return undefined;
  try {
    return await cache.match(request);
  } catch (error) {
    return undefined;
  }
}

async function storeInCache(cache, request, response) {
  if (!cache || !response.ok) return;
  try {
    await cache.put(request, response.clone());
  } catch (error) {
    console.warn('Kodingu: a response could not be cached.', error);
  }
}

async function precache() {
  const cache = await openCache();
  if (!cache) return;
  await Promise.all(
    SHELL.map(async (path) => {
      try {
        await cache.add(path);
      } catch (error) {
        console.warn(`Kodingu: ${path} could not be cached during install.`, error);
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      } catch (error) {
        console.warn('Kodingu: old offline caches could not be cleared.', error);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.origin !== self.location.origin) return;
  const data = event.data;
  if (data?.type !== 'cache-page' || typeof data.url !== 'string') return;
  const url = new URL(data.url);
  if (url.origin !== self.location.origin) return;
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(url.href))
      .catch(() => {
        // The page is still usable online when its offline copy cannot be stored.
      })
  );
});

async function networkFirst(request) {
  const cache = await openCache();
  try {
    const response = await fetch(request);
    await storeInCache(cache, request, response);
    return response;
  } catch (error) {
    const url = new URL(request.url);
    const cached =
      (await matchCache(cache, request)) ||
      (await matchCache(cache, `${url.pathname}.html`)) ||
      (await matchCache(cache, `${url.pathname}index.html`)) ||
      (await matchCache(cache, 'offline.html'));
    if (cached) return cached;
    throw error;
  }
}

async function networkFirstAsset(request) {
  const cache = await openCache();
  try {
    const response = await fetch(request);
    await storeInCache(cache, request, response);
    return response;
  } catch (error) {
    const cached = await matchCache(cache, request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await openCache();
  const cached = await matchCache(cache, request);
  if (cached) return cached;
  const response = await fetch(request);
  await storeInCache(cache, request, response);
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const holdsCode = /\.(?:js|css)$/.test(url.pathname);
  let handler = cacheFirst;
  if (request.mode === 'navigate') handler = networkFirst;
  else if (holdsCode) handler = networkFirstAsset;
  event.respondWith(handler(request));
});
