import * as THREE from '../lib/three.module.js'
import { wireframe, graticule10 } from '../helperfunctions.js'
//import {TrackballControls} from '../lib/TrackballControls.js'
import { TrackballControls } from '../lib/three.TrackballControls.js'
import { DeviceOrientationControls } from '../lib/three.DeviceOrientationControls.js'
import deviceInfo from '../deviceInfo.js'

const Atlas = function () {
  let _this = this;
  const {height, width, mobile, webGL} = deviceInfo()

  const renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height)

  document.getElementById('WebGL-Output').appendChild(renderer.domElement)

  this.scenes = [new THREE.Scene()]
  this.currentScene = 0

  this.cameras = [
    new THREE.PerspectiveCamera(70, width/height, 1, 100000),
    new THREE.OrthographicCamera(width/-2, width/2, height/2, height/-2, 1, 100000)
  ]
  this.currentCamera = 0

  this.controllers = [
    new TrackballControls(this.cameras[this.currentCamera], renderer.domElement),
    new DeviceOrientationControls(this.cameras[this.currentCamera])
  ]
  this.currentController = 0

  this.clock = new THREE.Clock
  this.cameras[this.currentCamera].position.set(0,0,1)

  const graticule = wireframe(graticule10() , new THREE.LineBasicMaterial({color: 0x666666}))
  this.scenes[this.currentScene].add( graticule )
  
  this.render = function () {
    this.controllers[this.currentController].update(this.clock.getDelta())

    requestAnimationFrame(this.render.bind(this))
    renderer.render(this.scenes[this.currentScene], this.cameras[this.currentCamera])
  }
  this.render()

}

export default Atlas