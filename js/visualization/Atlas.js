import * as THREE from '../lib/three.module.js'
//hacked version of older trackball allowing rotation around z axis
import { TrackballControls } from '../lib/TrackballControls.js'
//import { TrackballControls } from '../lib/three.TrackballControls.js'
import { DeviceOrientationControls } from '../lib/three.DeviceOrientationControls.js'
import {UnrealBloomPass} from '../lib/postprocessing/UnrealBloomPass.js'
import {RenderPass} from '../lib/postprocessing/RenderPass.js'
import {EffectComposer} from '../lib/postprocessing/EffectComposer.js'

import Menu from '../controls/Menu.js'

import deviceInfo from '../deviceInfo.js'
import Asterisms from './asterisms.js'
import Bounds from './bounds.js'
import Graticule from './graticule.js'
import StarField from './starField.js'
import Planets from './planets.js'
import {handlePermissions} from '../controls/permissions.js'
import {highlight, setControlEvents} from '../controls/selector.js'
import { debounce } from '../helperfunctions.js'

const Atlas = function () {
  const {height, width, mobile, webGL} = deviceInfo()
  
  /*
    storing scene and camera in window scope ease the access for utilies like animated transitions
    considered bad practice might need refactor
  */
  const SCENE = window.scene = new THREE.Scene()
  SCENE.selectable = []
  const CAMERA = window.camera = new THREE.PerspectiveCamera(70, width/height, 1, 100000)

  //old shaders are not compatible with webgl2, thus using previous renderer version - deprecation incoming, upgrade advised
  const renderer = new THREE.WebGL1Renderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height)
  
  document.getElementById('WebGL-Output').appendChild(renderer.domElement)
  
  this.scenes = [SCENE]
  this.currentScene = 0

  const CONTROLS = window.controls = [new TrackballControls(CAMERA, renderer.domElement), new DeviceOrientationControls(CAMERA)]
  
  this.controllers = [
    new TrackballControls(CAMERA, renderer.domElement),
    new DeviceOrientationControls(CAMERA)
  ]

  this.controllers[0].noPan = true;
  this.controllers[0].minDistance = 100;
  this.currentController = 0

  this.clock = new THREE.Clock
  CAMERA.position.set(0,0,1)

  //store geometries in master object to ease rotations
  const geometries = new THREE.Object3D()
  this.scenes[this.currentScene].add( geometries )
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
  

  //CONTROLS
  Menu(this.scenes[this.currentScene])
  //handlePermissions(this.scenes[this.currentScene])
  setControlEvents()
  
  //POSTPROCESSING
  const renderScene = new RenderPass(this.scenes[this.currentScene], CAMERA)

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width,height),1.5, 0.4, 0.85)
  bloomPass.threshold = 0
  bloomPass.strength = 1.5
  bloomPass.radius = 0

  let composer = new EffectComposer(renderer)
  composer.addPass(renderScene)
  composer.addPass(bloomPass)
  //RENDER LOOP
  this.render = function () {
    CONTROLS[0].update(this.clock.getDelta())
    debounce(highlight(), .5, false) 
    requestAnimationFrame(this.render.bind(this))
    renderer.render(this.scenes[this.currentScene], CAMERA)
    composer.render()
  }
  this.render()
}

export default Atlas