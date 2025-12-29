var CACHE_NAME = 'spark-writers-v1';
var CORE = [
  '/',
  '/index.html',
  '/login.html',
  '/styles.css'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(CORE); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function(resp){
    return resp || fetch(e.request).then(function(r){
      try{ if (r && r.status===200 && r.type==='basic') { var copy = r.clone(); caches.open(CACHE_NAME).then(function(c){ c.put(e.request, copy); }); }
      }catch(err){ }
      return r;
    }).catch(function(){ return caches.match('/index.html'); });
  }));
});
