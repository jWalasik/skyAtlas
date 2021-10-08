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

  document.getElementById('controls-name').innerText = constellation.userData.fullName

  //fetch description
  const wikiHref = constellation.userData.fullName.replace(/ /g, '_') + '_(constellation)'
  getWikiData(wikiHref)
    .then(res => {
      const description = document.getElementById('controls-description')
      description.innerHTML = res.query.pages[0].extract
      //save data for later usage
      constellation.userData.wiki = res.query.pages[0].extract
    })
    .catch(err => console.log(err))
  
  return container
}

export default Constellation