/*clear storage - just run this snippet in console
window.indexedDB.databases().then((r) => {
    for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
}).then(() => {
    alert('All data cleared.');
});
*/
const downloadData = () =>{
    console.log('downloading content')
    let data = {
        stars: [],
        bounds: [],
        lines: []
    }
    queue()
        .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv")
        .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json")
        .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json")
        .await(storeFiles)
}

const cacheName = 'static-v1'

const processData = () => {
    const cache = caches.open(cacheName).then(cache => cache)
    console.log(cache)
    downloadData()
}

const storeFiles = (err,stars, bounds, lines) => {
    console.log(err, stars, bounds, lines)
    if(err) console.log(err)
    return caches.open(cacheName).then(cache => {
        return cache.addAll([stars,bounds,lines])
    })
}

const loadOfflineFiles = event => {
    return caches.match(event.request).then(match => {
        return match || fetch(event.request)
    })
}