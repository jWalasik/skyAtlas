import * as THREE from '../lib/three.module.js'

export function rotateCameraTo(start, target, acc) {
  if(acc >= 1) return
  THREE.Quaternion.slerp(start, target, start, acc)
  setTimeout(()=> rotateCameraTo(start, target, (acc+1/100)), 20)
}