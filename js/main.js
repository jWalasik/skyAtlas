import deviceInfo from './deviceInfo.js'
import parseData from './parseData.js'
import shaderLoader from './shaderLoader.js'

const display = document.getElementById('WebGL-Output')
const loadingScreen = document.getElementById('loading-screen')
const status = document.getElementById('loading-screen__status')
const device = deviceInfo()

let database

export default function start() {
  //check device compatibility

  //load data
  parseData(database).then(data => {
    console.log('data', database)
  })
  
  shaderLoader().then(shaders => console.log(shaders))

  // initScene()
  // setupCameras()
  // buildUI()

  // render()
  
}

document.addEventListener('DOMContentLoaded', start())
document.getElementById('menu').addEventListener('click', function(e) {
  const [list, icon] = this.children
  list.classList.toggle('menu-list--collapsed')
  icon.classList.toggle('menu-icon--spin')
})