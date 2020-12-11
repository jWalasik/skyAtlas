import * as THREE from '../lib/three.module.js'
import {SolarSystem} from '../lib/solarSystem.js'

const system = new SolarSystem()
const loader = new THREE.TextureLoader()

const Planets = async () => {
  system.compute()
  const planets = system.geocentricCoords().map(planet => {
    console.log(planet)
    const map = loader.load(`/assets/bodies/${planet.name}-map.jpg`)
    const sphere = new THREE.SphereBufferGeometry(1,32,32)
    const planetBody = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({map}))
    
    return planetBody
  })
  console.log(planets)
}

export default Planets