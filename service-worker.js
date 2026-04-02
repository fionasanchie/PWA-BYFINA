const CACHE_NAME = "byfina-cache-v1";

// All files to pre‑cache – note the URL‑encoded apostrophe (%27) and spaces (%20)
const urlsToCache = [
  // "/",
  "/index..html",          // note the uppercase .HTML
  "/byfina.css",
  "/manifest.json",

  // BYFINA'S IMG folder (apostrophe + space)
  "/BYFINA%27S%20IMG/ABOUT.png",
  "/BYFINA%27S%20IMG/BABYPINK.png",
  "/BYFINA%27S%20IMG/BYFINA%20LOGO.png",
  "/BYFINA%27S%20IMG/ORANGE.png",
  "/BYFINA%27S%20IMG/PEACH.png",
  "/BYFINA%27S%20IMG/PINK.png",
  "/BYFINA%27S%20IMG/PURPLE.png",
  "/BYFINA%27S%20IMG/RED.png",
  "/BYFINA%27S%20IMG/WHITE.png",
  "/BYFINA%27S%20IMG/YELLOW.png",

  // BYF-DATES
  "/BYF-DATES/DATES.jpg",
  "/BYF-DATES/DAT%20EIGHT.jpg",
  "/BYF-DATES/DAT%20FIVE.jpg",
  "/BYF-DATES/DAT%20FOUR.jpg",
  "/BYF-DATES/DAT%20ONE.jpg",
  "/BYF-DATES/DAT%20SEVEN.jpg",
  "/BYF-DATES/DAT%20SIX.jpg",
  "/BYF-DATES/DAT%20THREE.jpg",
  "/BYF-DATES/DAT%20TWO.jpg",

  // BYF-WEDDING IMG (space in folder name)
  "/BYF-WEDDING%20IMG/wedding.jpg",
  "/BYF-WEDDING%20IMG/WEB%20THREE.jpg",
  "/BYF-WEDDING%20IMG/WED%20EIGHT.jpg",
  "/BYF-WEDDING%20IMG/WED%20FIVE.jpg",
  "/BYF-WEDDING%20IMG/WED%20FOUR.jpg",
  "/BYF-WEDDING%20IMG/WED%20ONE.jpg",
  "/BYF-WEDDING%20IMG/WED%20SEVEN.jpg",
  "/BYF-WEDDING%20IMG/WED%20SIX.jpg",
  "/BYF-WEDDING%20IMG/WED%20TWO.jpg",

  // BYF-CASUAL
  "/BYF-CASUAL/CASUAL.jpg",
  "/BYF-CASUAL/CAS%20EIGHT.jpg",
  "/BYF-CASUAL/CAS%20FIVE.jpg",
  "/BYF-CASUAL/CAS%20FOUR.jpg",
  "/BYF-CASUAL/CAS%20ONE.jpg",
  "/BYF-CASUAL/CAS%20SEVEN.jpg",
  "/BYF-CASUAL/CAS%20SIX.jpg",
  "/BYF-CASUAL/CAS%20THREE.jpg",
  "/BYF-CASUAL/CAS%20TWO.jpg"
];

// Install: cache all files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Caching all static assets...");
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error("Cache addAll failed:", err))
  );
  self.skipWaiting(); // activate immediately
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log("Deleting old cache:", key);
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fallback to network, cache new files
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(networkResponse => {
        // Cache new files (same origin, successful response)
        if (networkResponse && networkResponse.status === 200 &&
            event.request.url.startsWith(self.location.origin)) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback – serve main HTML
      return caches.match("/byfina.HTML");
    })
  );
});