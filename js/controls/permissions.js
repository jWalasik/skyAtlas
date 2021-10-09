import * as THREE from '../lib/three.module.js'
import {computeZenith, compassHeading, debounce} from '../helperfunctions.js'
import { rotateCameraTo } from '../visualization/animate.js'
import { clearModal, setModal } from './modal.js'

const modal = document.getElementById('modal')

export function handlePermissions(scene) {
  navigator.permissions.query({name: 'geolocation'}).then(res => {
    if(res.state === 'granted') {
      useLocation(null, scene)
    } else if (res.state === 'prompt') {
      handleModal()
    }
    res.onchange = function() {
      handlePermissions(scene)
    }
  })
  // navigator.permissions.query({name: 'deviceorientation'}).then(res => {
  //   console.log('dev orientation',res)
  // })
  if(window.DeviceOrientationEvent && 'ontouchstart' in window) useDeviceOrientation()
}

export function useLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    //clearModal()
    const {latitude, longitude} = position.coords
    const center = new THREE.Vector3(0,12000,0)
    const target = new THREE.Quaternion().setFromUnitVectors(
      computeZenith(latitude, longitude).normalize(),
      center.normalize()
    )
    const geometries = window.scene.getObjectByName('galaxy').quaternion
    rotateCameraTo(geometries, target, .01)
  },
  err=>{
    alert(err)
  })
}

export function useDeviceOrientation() {
  window.addEventListener(
    'deviceorientation', 
    debounce(
      e => {
        const heading = compassHeading(e.alpha, e.beta, e.gamma)
        window.controls.active.alphaOffset = heading
        window.controls.active.update()
      },
      100, 
      true // 
    ), 
    true  //absolute uses north magnetic declination instead of device frame
  )
}

function handleModal() {
  const node = document.createElement('div')
  node.classList.add('modal-permission')

  node.innerText = 'Enable geolocation to display current sky in your area'
  const enableButton = document.createElement('button')

  enableButton.classList.add('modal-button')

  enableButton.innerText = 'Enable'
  enableButton.addEventListener('click', useLocation)

  node.appendChild(enableButton)

  caches.has('skyAtlas-prevent-welcome').then(exists => {
    if(exists) {
      const dismissButton = document.createElement('button')
      dismissButton.classList.add('modal-button')
      dismissButton.innerText = 'Dismiss'
      dismissButton.addEventListener('click', clearModal)
      node.appendChild(dismissButton)
    }})

  setModal(node)
}