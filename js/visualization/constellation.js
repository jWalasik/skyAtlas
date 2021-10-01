import { descriptionModal } from '../controls/modal.js'
import { changeLevel } from '../controls/selector.js'
import { GalaxyDB } from '../database.js'
import * as THREE from '../lib/three.module.js'
import { getWikiData } from '../utils/wikiLookup.js'
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
    const btn = document.getElementById('return-button')
    changeLevel(btn.value)
  }

  //handle controls
  const display = document.getElementById('display')

  const returnArrow = document.createElement('img')
  returnArrow.setAttribute('src', 'assets/icons/return-icon.png')
  returnArrow.setAttribute('alt', 'return arrow')

  const button = document.createElement('button')
  button.appendChild(returnArrow)
  button.classList = 'button button-return'
  button.id = 'return-button'
  button.value = 'galaxy'

  button.addEventListener('click', handleReturn)

  display.appendChild(button)

  //fetch description
  const wikiHref = constellation.userData.fullName.replace(/ /g, '_') + '_(constellation)'
  getWikiData(wikiHref)
    .then(res => {
      descriptionModal(res.query.pages[0].extract)
    })
    .catch(err => console.log(err))
  
  return container
}

export default Constellation