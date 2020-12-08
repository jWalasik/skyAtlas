const cacheName = "galaxy-db"

const parseData = () => {
  //check local storage for data
  return caches.has(cacheName).then((hasCache)=>{
    if(!hasCache){
      console.log('cache has no data stored - downloading...')
      const urls = [
        'https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv',
        'https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json',
        'https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json'
      ]

      return Promise.all([
        d3.csv(urls[0]),
        d3.json(urls[1]),
        d3.json(urls[2])
      ])
      .then((values)=>{
        database = {
          stars: values[0],
          bounds: values[1],
          lines: values[2]
        }
        storeData(database)
        return database
      })
      .catch(err=>console.log(err))
    }
    else {
      console.log('cache detected - loading data...')
      return caches.open(cacheName).then(cache => 
        cache.match('db.json').then((result)=> result.json())
      )
    }    
  })
}

const storeData = (database)=>{
  caches.open(cacheName).then(cache=>{
    const jsonRes = new Response(JSON.stringify(database), {
      headers: {
        'content-type': 'application/json'
      }
    })
    cache.put('db.json', jsonRes)
  })
}
