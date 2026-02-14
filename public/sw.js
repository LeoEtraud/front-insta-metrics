// SERVICE WORKER PARA PWA - GERENCIA CACHE OFFLINE E INSTALAÇÃO
// VERSÃO DO CACHE - ATUALIZE ESTA VERSÃO QUANDO FIZER DEPLOY PARA FORÇAR ATUALIZAÇÃO
const CACHE_VERSION = 'v2';
const CACHE_NAME = `insta-metrics-${CACHE_VERSION}`;
const RUNTIME_CACHE = `insta-metrics-runtime-${CACHE_VERSION}`;

// INSTALA O SERVICE WORKER E FORÇA ATIVAÇÃO IMEDIATA
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...', CACHE_VERSION);
  // FORÇA ATIVAÇÃO IMEDIATA PARA EVITAR TELA BRANCA
  self.skipWaiting();
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

  const url = new URL(event.request.url);
  
  // PARA HTML/INDEX.HTML: SEMPRE BUSCA DA REDE PRIMEIRO (NETWORK-FIRST)
  // Isso evita tela branca por cache desatualizado
  if (event.request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se conseguir buscar da rede, cacheia e retorna
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          }
          // Se falhar, tenta cache como fallback
          return caches.match(event.request);
        })
        .catch(() => {
          // Se offline, retorna cache se disponível
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }

  // PARA ASSETS (JS, CSS, IMAGES): CACHE-FIRST COM NETWORK FALLBACK
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna cache se disponível
        if (cachedResponse) {
          // Em background, verifica se há atualização
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }).catch(() => {});
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

