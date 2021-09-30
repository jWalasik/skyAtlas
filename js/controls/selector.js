import * as THREE from '../lib/three.module.js'
import { rotateCameraTo } from '../visualization/animate.js';
import { detailedView } from '../visualization/detailedView.js';
import Constellation from '../visualization/constellation.js'

let level = 'galaxy'

//pointers to keep track of previously selected objects
let SELECTED
let resized = false

const mouse = new THREE.Vector2();
const display = document.getElementById('WebGL-Output')

export function setControlEvents() {
  display.addEventListener('mousemove', getCoords, false)
  display.addEventListener('mousedown', isDrag, false);
  display.addEventListener('mouseup', mouseSelect, false);
  //display.addEventListener('wheel', zoomSelect, true)
}

export function highlight() {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(mouse, window.camera)
  ray.params.Points.threshold = 150

  let intersects = ray.intersectObjects(window.scene.selectable[level])

  if(intersects.length > 0 && level === 'constellation') {
    if(resized === true) {
      resized = false
      SELECTED.material.size /= 1.5
    }
    SELECTED = intersects[0].object
    if(resized === false) {
      resized = true
      SELECTED.material.size *= 1.5
    }

    document.getElementById('object-name').innerHTML = SELECTED.name
  }
  //highlights boundary background
  else if(intersects.length > 0) {
    //remove highlight from previous object
    if(SELECTED && intersects[0].object !== SELECTED) {
      SELECTED.material.opacity = 0.0
    }
    SELECTED = intersects[0].object
    SELECTED.material.opacity = 0.05

    document.getElementById('object-name').innerHTML = intersects[0].object.userData.fullName
  }
  
}

export function zoomSelect(e) {
  if(!window.scene.getObjectByName('galaxy')) return
  if(e.deltaY < 0 && window.camera.position.z <= 100) {
    changeLevel('constellation')
  }
}

//block execution on drag events to prevent intereference with camera controls
let startX,startY
function isDrag(e) {
  startX = e.offsetX
  startY = e.offsetY
}

function getCoords({clientX, clientY}) {
  mouse.x = ( clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( clientY / window.innerHeight ) * 2 + 1;
}

function mouseSelect(e) {
  if(e.which !== 1) return
  const dX = Math.abs(e.offsetX - startX),
        dY = Math.abs(e.offsetY - startY)

  const delta = 10 //distance in pixels
  if(dX < delta && dY < delta) {
    changeLevel('constellation')
    //geometries container is rotated by geolocation, because of that there is an offset between camera and selected objects
    //for now use raycasters to get proper angle to rotate, test adding new logic to trackball controls or wrapping camera in rotating object

    //copy selected object    
    const cRay = new THREE.Raycaster()
    cRay.setFromCamera(new THREE.Vector2(0,0), window.camera)
    const center = new THREE.Vector3().copy(cRay.ray.direction)

    const tRay = new THREE.Raycaster()
    tRay.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), window.camera)

    const target = new THREE.Vector3().copy(tRay.ray.direction)

    const rotateEnd = new THREE.Quaternion()
    rotateEnd.setFromUnitVectors( center, target )
    const rotateStart = new THREE.Quaternion().set(0, 0 , 0 , -1)


    //window.controls.active.rotateCameraTowards(q)
    //window.camera.position.applyQuaternion(rotateEnd)

    const rotate = (acc) => {
      setTimeout(()=>{
        if(rotateStart.equals(rotateEnd)) return
        rotateStart.rotateTowards(rotateEnd, acc)
        window.camera.position.applyQuaternion(rotateStart)
        rotate(acc + acc)
      }, 20)
    }
    rotate(0.0014)    
  }
}

export const changeLevel = (lvl) => {
  const scene = window.scene
  switch (lvl) {
    case 'constellation':
      const constellation = Constellation(SELECTED)
      scene.add(constellation)
      level = 'constellation'
      scene.getObjectByName('galaxy').visible = false
      //clear current selection to prevent unintended interaction
      SELECTED = undefined
      break
    case 'object':
      break
    case 'galaxy':
    default:
      scene.getObjectByName('galaxy').visible = true
      level = 'galaxy'
      break
  }
}

