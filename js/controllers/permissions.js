import * as THREE from '../lib/three.module.js'
import {computeZenith} from '../helperfunctions.js'
import { rotateCameraTo } from '../visualization/animate.js'

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
}

export function useLocation(e, scene) {
  navigator.geolocation.getCurrentPosition(position => {
    clearModal()
    const {latitude, longitude} = position.coords
    const center = new THREE.Vector3(0,12000,0)
    const target = new THREE.Quaternion().setFromUnitVectors(
      computeZenith(latitude, longitude).normalize(),
      center.normalize()
    )
    const geometries = window.scene.getObjectByName('geometries').quaternion
    rotateCameraTo(geometries, target, .01)
  },
  err=>{
    alert(err)
  })
}

function clearModal() {
  modal.innerHTML = ''
  modal.className = 'modal--hidden'
}

function handleModal() {
  modal.innerText = 'Enable geolocation to display current sky in your area'
  const enableButton = document.createElement('button'),
        dismissButton = document.createElement('button')
  enableButton.innerText = 'Enable'
  enableButton.addEventListener('click', useLocation)
  dismissButton.innerText = 'Dismiss'
  dismissButton.addEventListener('click', clearModal)

  modal.appendChild(enableButton)
  modal.appendChild(dismissButton)
  modal.classList.toggle('modal--hidden')
}