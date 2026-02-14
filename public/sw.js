// SERVICE WORKER PARA PWA - GERENCIA CACHE OFFLINE E INSTALAÇÃO
const CACHE_NAME = 'insta-metrics-v1';
const RUNTIME_CACHE = 'insta-metrics-runtime-v1';

// ARQUIVOS PARA CACHE ESTÁTICO (APENAS EM PRODUÇÃO)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

// INSTALA O SERVICE WORKER E CACHEIA ASSETS ESTÁTICOS
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ATIVA O SERVICE WORKER E LIMPA CACHES ANTIGOS
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// INTERCEPTA REQUISIÇÕES E USA CACHE QUANDO DISPONÍVEL
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições de API (sempre busca do servidor)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }

        // Busca da rede e cacheia para uso futuro
        return fetch(event.request)
          .then((response) => {
            // Só cacheia respostas válidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para cache
            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Se offline e não tiver cache, retorna página offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// ESCUTA MENSAGENS DO CLIENTE PARA ATUALIZAÇÃO DE CACHE
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

