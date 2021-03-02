import deviceInfo from './deviceInfo.js'
import {GalaxyDB} from './database.js'
import Atlas from './visualization/Atlas.js'

const loadingScreen = document.getElementById('loading-screen')
const display = document.getElementById('display')
const status = document.getElementById('status')
const galaxyDB = new GalaxyDB()

export default async function init() {
  //check device compatibility
  deviceInfo()
  status.innerHTML = 'Checking device compatibility'
  //load data
  status.innerHTML = 'Loading stellar data'
  await galaxyDB.fetchData()
  //database = parseData(database)
  status.innerHTML = 'Igniting star cores'
  //shaderLoader().then(shaders => console.log(shaders))
  status.innerHTML = 'Forging galaxies'
  new Atlas()

  //ready to render
  status.innerHTML = 'Welcome to skyAtlas'
  loadingScreen.classList.toggle('loading-screen--fade')
  setTimeout(()=>{
    loadingScreen.classList.toggle('loading-screen--hidden')
    display.classList.toggle('display-shown')
  }, 1500)
}

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(reg => {
    if(reg.scope !== "https://elpaleniozord.github.io/skyAtlas/") {
      console.log('sw registration in progress')
      navigator.serviceWorker.register('./serviceWorker.js')
        .then(()=>console.log('registered'))
        .catch((err)=>console.log(err))
    }
  })  
}

document.addEventListener('DOMContentLoaded', init())
