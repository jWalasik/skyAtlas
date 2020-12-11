import * as THREE from '../lib/three.module.js'
import { TrackballControls } from '../lib/three.TrackballControls.js'
import { DeviceOrientationControls } from '../lib/three.DeviceOrientationControls.js'
import deviceInfo from '../deviceInfo.js'
import Graticule from './graticule.js'
import {UnrealBloomPass} from '../lib/postprocessing/UnrealBloomPass.js'
import {RenderPass} from '../lib/postprocessing/RenderPass.js'
import {EffectComposer} from '../lib/postprocessing/EffectComposer.js'
import StarField from './starField.js'

const Atlas = function () {
  let _this = this;
  const {height, width, mobile, webGL} = deviceInfo()

  const renderer = new THREE.WebGL1Renderer({alpha: true});
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

  const graticule = Graticule()
  this.scenes[this.currentScene].add( graticule )
  console.time('star field')
  const starField = StarField()
  this.scenes[this.currentScene].add( starField )
  console.timeEnd('star field')
  
  const renderScene = new RenderPass(this.scenes[this.currentScene], this.cameras[this.currentCamera])

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width,height),1.5, 0.4, 0.85)
  bloomPass.threshold = 0
  bloomPass.strength = 1.5
  bloomPass.radius = 0

  let composer = new EffectComposer(renderer)
  composer.addPass(renderScene)
  composer.addPass(bloomPass)

  this.render = function () {
    this.controllers[this.currentController].update(this.clock.getDelta())

    requestAnimationFrame(this.render.bind(this))
    renderer.render(this.scenes[this.currentScene], this.cameras[this.currentCamera])
    composer.render()
  }
  this.render()

}

export default Atlas