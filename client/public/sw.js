var CACHE = "eventapp-v1";
var ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.svg",
  "/offline.html",
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE }).map(function(k) { return caches.delete(k) })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(networkFirst(e.request));
  } else if (e.request.mode === "navigate") {
    e.respondWith(navFirst(e.request));
  } else {
    e.respondWith(cacheFirst(e.request));
  }
});

async function cacheFirst(request) {
  var cached = await caches.match(request);
  if (cached) return cached;
  try {
    var res = await fetch(request);
    if (res.ok) {
      var clone = res.clone();
      caches.open(CACHE).then(function(cache) { cache.put(request, clone) });
    }
    return res;
  } catch (e) {
    return caches.match("/offline.html");
  }
}

async function networkFirst(request) {
  try {
    var res = await fetch(request);
    if (res.ok) {
      var clone = res.clone();
      caches.open(CACHE).then(function(cache) { cache.put(request, clone) });
    }
    return res;
  } catch (e) {
    var cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ message: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function navFirst(request) {
  try {
    var res = await fetch(request);
    if (res.ok) {
      var clone = res.clone();
      caches.open(CACHE).then(function(cache) { cache.put(request, clone) });
    }
    return res;
  } catch (e) {
    var cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline.html");
  }
}
