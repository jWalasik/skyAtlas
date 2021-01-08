import {toJSON} from './helperfunctions.js'

const cacheName = "galaxy-db"

let database = {}

export const GalaxyDB = function() {
  const files = [
    'bounds.json',
    'hyg.csv',
    'lines.json',
    'solar.json',
    'messier_objects.json'
  ]

  this.parseData = async function() {
    const path = 'assets/data/'
    await Promise.all(files.map(file => {
      const [id, type] = file.split('.')
      return fetch(path+file)
        .then(res => {
          if(type === 'json') return res.json()
          else {
            //hyg data is hosted in csv format to reduce bandwidth ~ 16mb to 3mb 
            return res.text()
          }
        })
        .then(data => {
          if(type==='csv') {
            //translate to json for convinience and client side storing
            database[id] = toJSON(data)
          }
          else {
            database[id] = data
          return data
          }          
        })
    }))
  }

  this.getData = function(id) {
    return id ? database[id] : database
  }
}

const parseData = (database) => {
  //check local storage for data
  return caches.has(cacheName).then((cache)=>{
    if(!cache){
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
        galaxyDB = {
          stars: values[0],
          bounds: values[1],
          lines: values[2]
        }
        storeData(galaxyDB)
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

export default parseData