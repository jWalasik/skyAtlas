import { cameraLock } from '../controls/selector.js'
import * as THREE from '../lib/three.module.js'
import { getWikiData } from '../utils/wikiLookup.js'

export const Planet = async (data) => {
  const sphere = new THREE.SphereGeometry(600, 64, 64)
  const material = new THREE.MeshBasicMaterial({
    map: await new THREE.TextureLoader().load(`./assets/bodies/${data.name}-map.jpg`),
    opacity: 1.0,

  })

  const planet = new THREE.Mesh(sphere, material)
  planet.layers.set(1)

  if(data.name === 'saturn') {
    const texture = new THREE.TextureLoader().load('./assets/bodies/saturn-ring.png')
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.offset.set(0.5, 0)
    texture.repeat.set(0.25, 1)

    const ringGeometry = new THREE.RingBufferGeometry(750,1450,64)
  

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    })
    const ring = new THREE.Mesh(ringGeometry, material)
    ring.rotation.x = Math.PI/2
    ring.layers.set(1)
    planet.add(ring)
  }

  document.getElementById('controls-name').innerText = data.name

  const wikiHref = data.name.replace(/ /g, '_') + '_(planet)'
  getWikiData(wikiHref)
    .then(res => {
      const description = document.getElementById('controls-description')
      description.innerHTML = res.query.pages[0].extract || 'Sorry! We could not find relevant wikipedia entry regarding this object :('  
    })
    .catch(err => console.log(err))

  window.scene.add(planet)
  cameraLock(false)
}