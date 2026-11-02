const CACHE = 'kodingu-v3';

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
  'assets/js/app.js',
  'assets/js/catalog.js',
  'assets/js/certificate.js',
  'assets/js/challenge.js',
  'assets/js/course.js',
  'assets/js/data.js',
  'assets/js/data-challenges.js',
  'assets/js/data-css-layout.js',
  'assets/js/data-css-modern.js',
  'assets/js/data-css.js',
  'assets/js/data-helpers.js',
  'assets/js/data-html-2.js',
  'assets/js/lesson-builder.js',
  'assets/js/data-html-3.js',
  'assets/js/data-js-data.js',
  'assets/js/data-js.js',
  'assets/js/data-projects.js',
  'assets/js/gamification.js',
  'assets/js/home.js',
  'assets/js/icons.js',
  'assets/js/js-runner.js',
  'assets/js/lesson.js',
  'assets/js/not-found.js',
  'assets/js/practice.js',
  'assets/js/progress.js',
  'assets/js/project.js',
  'assets/js/projects.js',
  'assets/js/runner-frame.js',
  'assets/js/theme-init.js',
  'assets/js/workspace.js'
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
  event.respondWith(request.mode === 'navigate' ? networkFirst(request) : cacheFirst(request));
});
