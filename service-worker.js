// service-worker.js

const CACHE_NAME = 'ecuaciones-cache-v1';
// Lista de archivos que se guardarán en la caché.
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js',
  // NOTA: Debes crear la carpeta /images/icons/ y añadir tus propios iconos.
  // Por ahora, estas rutas pueden dar error si no existen los archivos,
  // pero el service worker funcionará igualmente con los archivos que sí encuentre.
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

// Evento 'install': se dispara cuando el service worker se instala.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  // Esperamos a que la promesa de caches.open se resuelva.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Abriendo caché y guardando archivos principales');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Service Worker: Falló el cacheo de archivos durante la instalación', err);
      })
  );
});

// Evento 'fetch': se dispara cada vez que la página realiza una petición de red.
self.addEventListener('fetch', event => {
  console.log('Service Worker: Interceptando petición fetch para:', event.request.url);
  event.respondWith(
    // Buscamos si la petición ya está en la caché.
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en la caché, la devolvemos.
        if (response) {
          console.log('Service Worker: Devolviendo desde caché:', event.request.url);
          return response;
        }
        // Si no está en caché, la buscamos en la red.
        console.log('Service Worker: Buscando en la red:', event.request.url);
        return fetch(event.request);
      })
      .catch(err => {
        console.error('Service Worker: Error en el evento fetch', err);
      })
  );
});

// Evento 'activate': se dispara cuando el service worker se activa.
// Se usa para limpiar cachés antiguas y asegurar que la PWA usa la versión más reciente.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si la caché no está en nuestra "lista blanca", la borramos.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
