// Version du cache
const CACHE_NAME = 'World Music';
const urlsToCache = [
    '/', // Page principale
    '/index.html', // Page principale (redondance pour certains navigateurs)
    '/offline.html', // Page hors connexion
    '/WorldMusic.png', // Icône/logo
    'https://fonts.googleapis.com/css?family=Roboto', // Police Roboto
    'https://code.jquery.com/jquery-3.6.0.min.js' // jQuery
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', function(event) {
    event.respondWith(
        // Vérifier d'abord dans le cache
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response; // Servir depuis le cache si disponible
                }

                // Si pas dans le cache, tenter une requête réseau
                return fetch(event.request)
                    .then(function(networkResponse) {
                        // Si la requête réseau réussit, mettre à jour le cache
                        return caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    })
                    .catch(function() {
                        // Si la requête réseau échoue (hors connexion), afficher la page hors connexion
                        return caches.match('/offline.html');
                    });
            })
    );
});