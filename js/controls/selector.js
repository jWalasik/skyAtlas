import * as THREE from '../lib/three.module.js'

let SELECTED
const mouse = new THREE.Vector2();
const display = document.getElementById('WebGL-Output')

export function setControlEvents() {
  display.addEventListener('mousemove', getCoords, false)
  display.addEventListener('mousedown', isDrag, false);
  display.addEventListener('mouseup', mouseSelect, false);
  display.addEventListener('wheel', zoomSelect, true)
}

export function highlight() {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(mouse, window.camera)
  ray.params.Points.threshold = 50

  let intersects = ray.intersectObjects(window.scene.selectable)

  if(intersects.length > 0) {
    //remove highlight from previous object
    if(SELECTED && intersects[0].object !== SELECTED) {
      SELECTED.material.opacity = 0.0
    }
    SELECTED = intersects[0].object
    SELECTED.material.opacity = 0.05
    //document.getElementById('object').innerHTML = intersects[0].object.name
  }
}

export function zoomSelect(e) {
  if(e.deltaY < 0 && window.camera.position.z <= 100) {
    console.log('selected:',window.camera.position.z, SELECTED)
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
  const dX = e.offsetX - startX,
        dY = e.offsetY - startY
  
  const delta = 10 //distance in pixels
  if(dX < delta && dY < delta) {
    console.log('selected: ', SELECTED)
    //document.getElementById('object').innerHTML = intersects[0].object.name
  }
}


