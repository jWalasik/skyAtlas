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
  window.scene.add(planet)
}