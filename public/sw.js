
importScripts("/src/js/idb.js");
importScripts("/src/js/utilityDB.js");


const STATIC_CACHE_NAME = "static-v21";
const DYNAMIC_CACHE_NAME = "dynamic-v7";
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    "/src/js/idb.js",
    "/src/js/utilityDB.js",
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
    
    //var url = "https://pwadb-24d96.firebaseio.com/posts.json";
    var url = "https://us-central1-pwadb-24d96.cloudfunctions.net/storePostData";
    if (event.request.url.indexOf(url) > -1) {
      event.respondWith(
        fetch(event.request)
          .then(function (res) {
            let clonedRes = res.clone();
            clearAllData("posts")
              .then(function(){
                return clonedRes.json();
              })
              .then(function(data){
                for(let key in data){
                  writeData("posts", data[key]);
                }
              });
            return res;
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

  self.addEventListener('sync', function(event){
    console.log("[ServiceWorker] Syncing background data");
    if (event.tag === 'sync-posts'){
      console.log("[ServiceWorker] Syncing new posts");
      event.waitUntil(
        readAllData()
          .then(function(data){
            for(let dt of data){
              fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: {
                  id: dt.id,
                  title: dt.title,
                  location: dt.location,
                  image: dt.image
                }
              })
              .then(function(res){
                console.log("res: ", res);
                if(res.ok){
                  rs.json()
                    .then(function(resData){
                      deleteItemFromData('sync-posts', resData.id);
                    });
                }
              })
              .catch(function(err){
                console.log("[ServiceWorker] Error while syncing", err);
              });
            }
          })
      );
    }
  });