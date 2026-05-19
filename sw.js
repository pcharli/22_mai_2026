const VERSION = "V2";

//The list of file to cache
const CACHED = [
  "/",
  "/index.html",
  "/output.min.css",
  "/script.js",
  "/config.js",
  "/manifest.json",
  "/images/logo.jpg",
  "/icon/192.png",
  "/icon/512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

//proxy in SW
self.addEventListener("fetch", (e) => {
  e.respondWith(handleResponse(e));
});

//Dispatch the resposne handle based of the type of request
async function handleResponse(e) {
  // if the request is a navigation request (change of page)
  if (e.request.mode == "navigate") {
    return await handleNavigateReponse(e);
    //else if the request is a ressource request (css, js, images, API, etc)
  } else {
    return await handleRessourceResponse(e);
  }
}

//Handle navigation request with preloading features, network first
async function handleNavigateReponse(e) {
  try {
    // preload the response
    const preloadedResponse = await e.preloadResponse();
    if (preloadedResponse) return preloadedResponse;
    // fetch the response
    return await fetch(e.request);

    //no network, return cached response
  } catch (Exception) {
    const cache = await caches.open(VERSION);
    return cache.match(e.request);
  }
}

//Handle ressource response, network first
async function handleRessourceResponse(e) {
  try {
    // fetch the response
    return await fetch(e.request);
    //no network, return cached response
  } catch (Exception) {
    const cache = await caches.open(VERSION);
    return cache.match(e.request);
  }
}

//Listen for the service worker startup
//Skip the previous worker
//Fill the cache
self.addEventListener("install", (e) => {
  self.skipWaiting();

  e.waitUntil(fillCache());
});

//Listen for the activation of the service worker
//Force claims the clients
//Clear the cache the remove previous entries
self.addEventListener("activate", (e) => {
  clients.claim();

  e.waitUntil(cleanCache());
});

//Removed other service workers caches
async function cleanCache() {
  const keys = await caches.keys();
  // remove all caches except the current version
  for (const key of keys) {
    if (key != VERSION) {
      await caches.delete(key);
    }
  }
}

//Add cached file to cache
async function fillCache() {
  const cache = await caches.open(VERSION);
  cache.addAll(CACHED);
}
