const CACHE_NAME = 'sky-atlas-shell';

let filesToCache = [
  './js/main.js',
  './js/lib/three.module.js',
  './'
]

self.addEventListener('install', (event) => {
  console.log('installing')
  event.waitUntil(handleInstall())
})

async function handleInstall() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(filesToCache)
  return self.skipWaiting()
}
//cache first approach - disable for developement as each update will require purging data
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.open(CACHE_NAME).then(function(cache) {
//       return cache.match(event.request).then(function (response) {
//         return response || fetch(event.request).then(function(response) {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       });
//     })
//   );
// });