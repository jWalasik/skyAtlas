const CACHE_NAME = 'sky-atlas';

let filesToCache = [
  '.'
]

self.addEventListener('install', (event) => {
  console.log('installing')
  event.waitUntil(handleInstall())
})

async function handleInstall() {
  const cache = await caches.open(CACHE_NAME)
  console.log(cache)
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
