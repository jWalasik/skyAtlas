import deviceInfo from './deviceInfo.js'
import {GalaxyDB} from './database.js'
import Atlas from './visualization/Atlas.js'

import { clearModal, setModal } from './controls/modal.js'

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


  //ready to render
  status.innerHTML = 'Welcome to skyAtlas'
  loadingScreen.classList.toggle('loading-screen--fade')
  setTimeout(()=>{
    loadingScreen.classList.toggle('loading-screen--hidden')
    display.classList.toggle('display-shown')
  }, 1500)

  //display welcome message if user did not chose to hide it
  caches.has('skyAtlas-prevent-welcome').then(exists => {
    if(!exists) {
      const handleClose = () => {
        //save setting
        if(checkbox.checked) {
          caches.open('skyAtlas-prevent-welcome').then(cache => {
            const jsonRes = new Response(JSON.stringify('true'), {
              headers: {
                'content-type': 'application/json'
              }
            })
            cache.put('skyAtlas-prevent-welcome', jsonRes)
          })
        }

        //clear modal
        clearModal()
      }

      const h = document.createElement('h1')
      h.classList.add('modal-header')
      h.innerText = 'Welcome to skyAtlas!'

      const info = document.createElement('div')
      info.classList.add('modal-info')

      const addInfo = (text) => {
        const item = document.createElement('p')
        item.classList.add('modal-info__p')
        item.innerText = text

        return item
      }
      info.appendChild(addInfo("Manual calibration is currently disabled, if your screen doesn't reflect actual sky turn off 'North Orientation' option in menu and restart application while facing actual north."))

      info.appendChild(addInfo("You may access menu by using Right Mouse Button or Long Press on mobile"))

      const close = document.createElement('div')
      close.classList.add('modal-controls')
      
      const checkbox = document.createElement('input')
      checkbox.classList.add('modal-checkbox')
      checkbox.type = 'checkbox'
      checkbox.name = 'prevent-welcome'
      checkbox.value = false
      checkbox.id = 'prevent-welcome'

      const label = document.createElement('label')
      label.classList.add('modal-label')
      label.htmlFor = 'prevent-welcome'
      label.appendChild(document.createTextNode('Dont show this message again '))

      const closeButton = document.createElement('button')
      closeButton.classList.add('modal-button')
      closeButton.addEventListener('click', handleClose)
      closeButton.innerText = 'Close'
      
      const node = document.getElementById('modal-dialog')
      node.classList.add('modal')

      node.appendChild(h)
      node.appendChild(info)
      label.appendChild(checkbox)
      close.appendChild(label)
      close.appendChild(closeButton)
      node.appendChild(close)
      setModal(node)
    }
  })

  new Atlas()
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
