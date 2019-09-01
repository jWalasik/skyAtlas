const CACHE_NAME = 'sky-atlas';

let filesToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/lib/dat.gui.js',
  '/lib/d3.min.js',
  '/lib/TrackBallControls.js',
  '/lib/three.min.js',
  '/js/constellation.js',
  '/js/galaxy.js',
  '/js/geolocation.js',
  '/js/helperfunctions.js',
  '/js/highlight.js',
  '/js/index.js',
  '/js/object.js',
  '/js/return.js',
  '/js/skybox.js',
  '/js/wikiLookup.js',
  '/js/parseData.js'
]

self.addEventListener('install', (event) => {
  event.waitUntil(handleInstall())
})

async function handleInstall() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(filesToCache)
  return self.skipWaiting()
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(()=>{
      return caches.match(event.request)
    })
  )
})