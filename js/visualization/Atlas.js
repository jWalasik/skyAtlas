import * as THREE from '../lib/three.module.js'
//hacked version of older trackball allowing rotation around z axis
import { TrackballControls } from '../lib/TrackballControls.js'
//import { TrackballControls } from '../lib/three.TrackballControls.js'
import { DeviceOrientationControls } from '../lib/three.DeviceOrientationControls.js'
import {UnrealBloomPass} from '../lib/postprocessing/UnrealBloomPass.js'
import {RenderPass} from '../lib/postprocessing/RenderPass.js'
import {EffectComposer} from '../lib/postprocessing/EffectComposer.js'

import Menu from '../controls/menu.js'

import deviceInfo from '../deviceInfo.js'
import Asterisms from './asterisms.js'
import Bounds from './bounds.js'
import Graticule from './graticule.js'
import StarField from './starField.js'
import Planets from './planets.js'
import {handlePermissions} from '../controls/permissions.js'
import {highlight, setControlEvents} from '../controls/selector.js'
import { debounce } from '../helperfunctions.js'
import { starFieldTwinkle } from './animate.js'

const Atlas = function () {
  const {height, width, mobile, webGL} = deviceInfo()
  /*
    storing scene and camera in window scope ease the access for utilies like animated transitions
    considered bad practice might need refactor
  */
  const SCENE = window.scene = new THREE.Scene()
  SCENE.selectable = []
  const CAMERA = window.camera = new THREE.PerspectiveCamera(60, width/height, .1, 100000)
  CAMERA.zoom = 1
  //old shaders are not compatible with webgl2, thus using previous renderer version - deprecation incoming, upgrade advised
  const renderer = window.renderer = new THREE.WebGL1Renderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height)

  //flipping screen glitches coordinate system, block it
  window.addEventListener('resize', ()=> {
    renderer.setSize(window.innerWidth, window.innerHeight);
    CAMERA.fov = 60;
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
  })
  document.getElementById('WebGL-Output').appendChild(renderer.domElement)
  
  this.scenes = [SCENE]
  this.currentScene = 0

  const CONTROLS = window.controls = {}
  CONTROLS.options = [new TrackballControls(CAMERA, renderer.domElement), new DeviceOrientationControls(CAMERA)]
  CONTROLS.active = CONTROLS.options[0]
  CONTROLS.active.noPan = true;
  CONTROLS.active.minDistance = 100;

  this.clock = new THREE.Clock
  CAMERA.position.set(0,0,1) //z needs to be greater than 0 due to gimbal stuff

  //store geometries in master object to ease rotations
  const geometries = new THREE.Object3D()
  this.scenes[this.currentScene].add( geometries )
  this.scenes[this.currentScene].add( CAMERA )
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

  //CONTROLS
  Menu()
  handlePermissions(this.scenes[this.currentScene])
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
    CONTROLS.active.update(this.clock.getDelta())
    debounce(highlight(), .5, false)
    starFieldTwinkle()
    requestAnimationFrame(this.render.bind(this))
    renderer.render(SCENE, CAMERA)
    composer.render()
  }
  this.render()
}

export default Atlas