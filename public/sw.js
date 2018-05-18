self.addEventListener('install', function(event){
    console.log(" [ServiceWorker] Installing Service Worker...", event);
});

self.addEventListener('activate', function(event){
    console.log(" [ServiceWorker] Activating Service Worker...", event);
    return self.clients.claim();
});

self.addEventListener('fetch', function(event){
    console.log(" [ServiceWorker] Fetch something ...", event);
});