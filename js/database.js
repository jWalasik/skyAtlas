import {toJSON} from './helperfunctions.js'

const cacheName = "galaxy-db"

let database = {}

export const GalaxyDB = function() {
  const files = [
    'boundaries.json',
    'hyg.csv',
    'lines.json',
    'solar.json',
    'messier_objects.json'
  ]

  this.loadFromCache = async function() {
    return caches.open(cacheName)
      .then(cache => cache.match('db.json')
      .then(db => db.json()))
  }

  this.downloadData = async function() {
    let temp = {}
    const path = 'assets/data/'
    return Promise.all(files.map(file => {
      const [id, type] = file.split('.')
      return fetch(path+file)
        .then(res => {
          if(type === 'json') return res.json()
          else return res.text() //hyg data is hosted in csv format to reduce bandwidth ~ 16mb to 3mb
        })
        .then(data => temp[id] = type === 'json' ? data : toJSON(data))        
    }))
    .then(() => {
      this.storeData(temp)
      return temp
    })
    .catch(err => console.log(err))
  }

  this.fetchData = async function() {
    return caches.has(cacheName).then(cache => {
      if(!cache) return this.downloadData()
      else return this.loadFromCache()
    })
    .then(data => {
      database = data
    })
    .catch(err => console.log(err))
  }

  this.getData = function(id) {
    return id ? database[id] : database
  }

  this.storeData = function(data) {
    caches.open(cacheName).then(cache=>{
      const jsonRes = new Response(JSON.stringify(data), {
        headers: {
          'content-type': 'application/json'
        }
      })
      cache.put('db.json', jsonRes)
    })
  }
}