import * as THREE from '../lib/three.module.js'

export function rotateCameraTo(start, target, acc) {
  THREE.Quaternion.slerp(start, target, start, acc)
  if(acc >= 1) return  
  setTimeout(()=> rotateCameraTo(start, target, (acc+1/100)), 20)
}