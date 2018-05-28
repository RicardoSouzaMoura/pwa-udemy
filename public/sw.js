const STATIC_CACHE_NAME = "static-v11";
const DYNAMIC_CACHE_NAME = "dynamic-v5";
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    //'/src/js/promise.js',
    //'/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
  ];

  self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME)
        .then(function (cache) {
          console.log('[Service Worker] Precaching App Shell');
          return cache.addAll(STATIC_FILES);
        })
    )
  });

self.addEventListener('activate', function(event){
    console.log(" [ServiceWorker] Activating Service Worker...", event);
    event.waitUntil(
        caches.keys()
            .then(function (keyList){
                return Promise.all(keyList.map(function(key){
                    if (key != STATIC_CACHE_NAME && key != DYNAMIC_CACHE_NAME){
                        console.log("[ServiceWorker] removing old cache: ", key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
      console.log('matched ', string);
      cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
      cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
  }

self.addEventListener('fetch', function (event) {

    // event.respondWith(
    //   fetch(event.request)
    // );
    var url = "https://pwadb-24d96.firebaseio.com/posts.json";
    if (event.request.url.indexOf(url) > -1) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE_NAME)
          .then(function (cache) {
            return fetch(event.request)
              .then(function (res) {
                // trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request, res.clone());
                return res;
              });
          })
      );
     } else if (isInArray(event.request.url, STATIC_FILES)) {
       event.respondWith(
         caches.match(event.request)
            .then(function(response){
              return response;
            })
       );
      } else {
        event.respondWith(
          caches.match(event.request)
            .then(function (response) {
              if (response) {
                return response;
              } else {
                return fetch(event.request)
                  .then(function (res) {
                    return caches.open(DYNAMIC_CACHE_NAME)
                      .then(function (cache) {
                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                        cache.put(event.request.url, res.clone());
                        return res;
                      })
                  })
                  .catch(function (err) {
                    return caches.open(STATIC_CACHE_NAME)
                      .then(function (cache) {
                        if (event.request.headers.get('accept').includes('text/html')) {
                          return cache.match('/offline.html');
                          }
                      });
                  });
              }
            })
        );
      }
  });