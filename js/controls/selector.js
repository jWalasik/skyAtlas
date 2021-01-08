import * as THREE from '../lib/three.module.js'

let INTERSECTED, X, Y, Z=1
const display = document.getElementById('WebGL-Output')

export function useSelectors() {
  display.addEventListener('mousemove', mouseCoords, false)
  display.addEventListener('mousedown', isDrag, false);
  display.addEventListener('mouseup', mouseSelect, false);
}

export function zoomSelect() {

}

//block execution on dragging, because of camera controls
let startX,startY
function isDrag(e) {
  startX = e.offsetX
  startY = e.offsetY
}
  
function mouseSelect(e) {
  const dX = e.offsetX - startX,
        dY = e.offsetY - startY
  
  const delta = 10 //distance in pixels
  if(dX < delta && dY < delta) {
    const target = new THREE.Vector3(X,Y,Z)
    target.unproject(window.camera)
    const ray = new THREE.Raycaster(window.camera.position, target.normalize())

    ray.params.Points.threshold = 500
    let intersects = ray.intersectObjects(window.scene)
    console.log(intersects)

    if(intersects.length > 0) {
      console.log(intersects)
    }
    //document.getElementById('object').innerHTML = intersects[0].object.name
  }
}

export function mouseCoords({clientX, clientY}) {
  X = clientX / window.innerWidth * 2 - 1,
  Y = clientY / window.innerHeight * 2 + 1
}
