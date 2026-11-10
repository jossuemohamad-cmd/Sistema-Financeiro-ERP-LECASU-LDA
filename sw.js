/**
 * LECASU, LDA. - Service Worker para PWA Desktop
 */

const CACHE_NAME = 'lecasu-erp-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/login.html',
  '/dashboard.html',
  '/financeiro.html',
  '/clientes-fornecedores.html',
  '/materia.html',
  '/rh.html',
  '/ativos-inventarios.html',
  '/relatorios.html',
  '/configuracoes.html',
  '/css/style.css',
  '/js/data.js',
  '/js/db-client.js',
  '/js/app.js',
  '/js/chart.umd.min.js',
  '/assets/logo.png',
  '/assets/icon.png',
  '/assets/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Cache parcial de ativos no Service Worker:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignora chamadas de API e conexões com Neon
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

