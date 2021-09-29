import { changeLevel } from '../controls/selector.js'
import { GalaxyDB } from '../database.js'
import * as THREE from '../lib/three.module.js'
import { starSimple } from './star.js'
import StarField from './starField.js'

const Constellation = (constellation) => {
  window.scene.selectable.constellation = []
  const container = new THREE.Object3D()
  container.name = `${constellation.name}-container`

  const asterism = constellation.userData.asterism.clone()
  container.add(asterism)

  const background = StarField(constellation.userData.minorStars)
  container.add(background)

  const majorStars = constellation.userData.majorStars
  majorStars.forEach(star => {
    const starObj = starSimple(star)
    container.add(starObj)
    window.scene.selectable.constellation.push(starObj)
  })
  const objects = constellation.userData.linkedObjects

  objects.forEach(obj => {
    const copy = window.scene.getObjectByName(obj).clone()
    container.add(copy)
    window.scene.selectable.constellation.push(copy)
  })

  //add return button
  const handleReturn = () => {
    const constellation = window.scene.getObjectByName(container.name)
    window.scene.remove(constellation)
    document.getElementById('return-button').remove()
    changeLevel('galaxy')
  }
  const display = document.getElementById('display')
  const returnArrow = document.createElement('img')
  returnArrow.setAttribute('src', 'assets/icons/return-icon.png')
  returnArrow.setAttribute('alt', 'return arrow')
  const button = document.createElement('button')
  button.appendChild(returnArrow)
  button.classList = 'button button-return'
  button.id = 'return-button'

  button.addEventListener('click', handleReturn)

  display.appendChild(button)

  return container
}

export default Constellation