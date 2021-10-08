import * as THREE from '../lib/three.module.js'
import { rotateCameraTo } from '../visualization/animate.js';
import { detailedView } from '../visualization/detailedView.js';
import Constellation from '../visualization/constellation.js'
import { StarBody } from '../visualization/object.js'

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
    changeLevel(level === 'galaxy' ? 'constellation' : 'object') 
  }
}

export const changeLevel = (next) => {
  const scene = window.scene
  switch (next) {
    case 'constellation':
      if(level === 'object') {
        scene.children[2].visible = true
        //change description and name
        const constellation = scene.getObjectByName(scene.children[2].name.replace(/-container/g, ''))
        document.getElementById('controls-name').innerText = constellation.userData.fullName
        document.getElementById('controls-description').innerHTML = constellation.userData.wiki
        //update return button
        document.getElementById('return-button').value = 'galaxy'
        //dispose of object
        scene.remove(scene.children[3])
      } else {
        const constellation = Constellation(SELECTED)
        scene.add(constellation)

        scene.getObjectByName('galaxy').visible = false
        centerCameraOn(scene.children[2])
        document.getElementById('controls-overlay').classList.toggle('controls-overlay__hidden')
      }
      level = 'constellation'
      cameraLock(true)
      break
    case 'object':
      scene.getObjectByName(SELECTED.parent.name).visible = false
      StarBody(SELECTED)
      document.getElementById('return-button').value = 'constellation'
      level = 'object'
      break
    case 'galaxy':
    default:
      if(level === 'constellation') {
        //constellation should always have the same index, might need refactor
        const disposable = scene.children[2]
        scene.remove(disposable)

        document.getElementById('controls-overlay').classList.toggle('controls-overlay__hidden')
      }
      scene.getObjectByName('galaxy').visible = true
      level = 'galaxy'

      cameraLock(false)
      window.camera.zoom = 1
      window.camera.updateProjectionMatrix()
      break
  }
}

const centerCameraOn = (container) => {
  const bCenter = new THREE.Box3().setFromObject(container).getCenter()
  //const camDirection = new THREE.Quaternion().copy(camera.quaternion)
  const camDirection = camera.getWorldDirection().clone()
  const target = new THREE.Quaternion().setFromUnitVectors(bCenter.normalize(), camDirection.normalize())

  const animate = (acc) => {
    if(acc>=1) return
    THREE.Quaternion.slerp(container.quaternion, target, container.quaternion, acc)
    setTimeout(()=>animate(acc+1/100), 20)
    camera.zoom = 1+acc
    camera.updateProjectionMatrix()
  }
  animate(1/100)
}

const cameraLock = (bool) => {
  const controls = window.controls.active
  controls.noRoll = bool
  controls.noRotate = bool
}