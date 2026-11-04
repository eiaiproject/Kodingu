const CACHE = 'kodingu-v6';

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
  '404.html',
  'favicon.svg',
  'assets/css/base.css',
  'assets/css/app.css',
  'assets/js/core/app.js',
  'assets/js/pages/catalog.js',
  'assets/js/pages/certificate.js',
  'assets/js/pages/challenge.js',
  'assets/js/pages/course.js',
  'assets/js/data/course-index.js',
  'assets/js/data/data.js',
  'assets/js/data/data-challenges.js',
  'assets/js/data/data-css-layout.js',
  'assets/js/data/data-css-modern.js',
  'assets/js/data/data-css.js',
  'assets/js/data/data-css-components.js',
  'assets/js/data/data-helpers.js',
  'assets/js/data/data-html-2.js',
  'assets/js/data/lesson-builder.js',
  'assets/js/data/data-html-3.js',
  'assets/js/data/data-html-4.js',
  'assets/js/data/data-js-data.js',
  'assets/js/data/data-js.js',
  'assets/js/data/data-js-modern.js',
  'assets/js/data/data-projects.js',
  'assets/js/core/gamification.js',
  'assets/js/pages/home.js',
  'assets/js/core/icons.js',
  'assets/js/editor/js-runner.js',
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const url = new URL(request.url);
    const cached =
      (await cache.match(request)) ||
      (await cache.match(`${url.pathname}.html`)) ||
      (await cache.match(`${url.pathname}index.html`)) ||
      (await cache.match('404.html'));
    if (cached) return cached;
    throw error;
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const holdsCode = /\.(?:js|css)$/.test(url.pathname);
  event.respondWith(
    request.mode === 'navigate'
      ? networkFirst(request)
      : holdsCode
        ? networkFirstAsset(request)
        : cacheFirst(request)
  );
});
