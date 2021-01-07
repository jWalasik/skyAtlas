import * as THREE from '../lib/three.module.js'
//hacked version of older trackball allowing rotation around z axis
import { TrackballControls } from '../lib/TrackballControls.js'
//import { TrackballControls } from '../lib/three.TrackballControls.js'
import { DeviceOrientationControls } from '../lib/three.DeviceOrientationControls.js'
import {UnrealBloomPass} from '../lib/postprocessing/UnrealBloomPass.js'
import {RenderPass} from '../lib/postprocessing/RenderPass.js'
import {EffectComposer} from '../lib/postprocessing/EffectComposer.js'

import Menu from '../controllers/Menu.js'

import deviceInfo from '../deviceInfo.js'
import Asterisms from './asterisms.js'
import Bounds from './bounds.js'
import Graticule from './graticule.js'
import StarField from './starField.js'
import Planets from './planets.js'
import {handlePermissions} from '../controllers/permissions.js'

const Atlas = function () {
  /*storing scene in window scope ease the access for utilies like animated transitions but is considered bad practice might need refactor*/
  const SCENE = window.scene = new THREE.Scene()
  const {height, width, mobile, webGL} = deviceInfo()

  //old shaders are not compatible with webgl2, thus using previous renderer version - deprecation incoming, upgrade advised
  const renderer = new THREE.WebGL1Renderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height)
  
  document.getElementById('WebGL-Output').appendChild(renderer.domElement)
  
  this.scenes = [SCENE]
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
  this.controllers[0].noPan = true;
  this.currentController = 0

  this.clock = new THREE.Clock
  this.cameras[this.currentCamera].position.set(0,0,1)

  //store geometries in master object to ease rotations
  const geometries = new THREE.Object3D()
  geometries.name = 'geometries'
  //GEOMETRIES
  console.time('geometries')
  const graticule = Graticule()
  geometries.add( graticule )
  
  const boundaries = Bounds()
  geometries.add( boundaries )

  const asterisms = Asterisms()
  geometries.add( asterisms )

  const starField = StarField()
  geometries.add( starField )
  
  //promise due to async texture loader
  Planets().then(planets => {
    geometries.add( planets )
  })
  console.timeEnd('geometries')
  this.scenes[this.currentScene].add( geometries )

  //CONTROLS
  Menu(this.scenes[this.currentScene])
  handlePermissions(this.scenes[this.currentScene])
  
  //POSTPROCESSING
  const renderScene = new RenderPass(this.scenes[this.currentScene], this.cameras[this.currentCamera])

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width,height),1.5, 0.4, 0.85)
  bloomPass.threshold = 0
  bloomPass.strength = 1.5
  bloomPass.radius = 0

  let composer = new EffectComposer(renderer)
  composer.addPass(renderScene)
  composer.addPass(bloomPass)

  //RENDER LOOP
  this.render = function () {
    this.controllers[this.currentController].update(this.clock.getDelta())

    requestAnimationFrame(this.render.bind(this))
    renderer.render(this.scenes[this.currentScene], this.cameras[this.currentCamera])
    composer.render()
  }
  this.render()
}

export default Atlas