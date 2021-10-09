import * as THREE from '../lib/three.module.js'
import {SolarSystem} from '../lib/solarSystem.js'
import { vertex } from '../helperfunctions.js'

const system = new SolarSystem()
const loader = new THREE.TextureLoader()

function linkToConstellation(object) {
  const center = new THREE.Vector3(0,0,0)
  const ray = new THREE.Raycaster(center, new THREE.Vector3().copy(object.position).normalize())
  ray.params.Points.threshold = 5
  const intersections = ray.intersectObjects(window.scene.selectable.galaxy)
  //triangulation method is bugged causing boundaries to overlap sometimes
  //temporary fix
  intersections.forEach(constellation => {
    constellation.object.userData.linkedObjects.add(object.name)
  })
}

function updatePosition() {
  setInterval(()=>{
    system.compute()
    system.geocentricCoords().map(planet => {
      if(planet.name === 'earth' || planet.name==='pluto') return
      const object = window.scene.getObjectByName(planet.name)
      const {x,y,z} = vertex([planet.ra*15,planet.dec])
      object.position.set(x,y,z)
      linkToConstellation(object)
    })
  }, 300000) //5min 300000
}

const Planets = async () => {
  system.compute()
  const planets = new THREE.Object3D()
  planets.name = 'planets'
  return Promise.all(
     system.geocentricCoords().map(planet => {
      if(planet.name === 'earth' || planet.name==='pluto') return
      //detailed map with high resultion, wasted of resources with such small size, good for detailed view though
      //const map = loader.load(`/assets/bodies/${planet.name}-map.jpg`)
      const map = new THREE.MeshBasicMaterial({color: info[planet.name].color})
      const sphere = new THREE.SphereBufferGeometry(info[planet.name].size*3,10,10)
      const planetBody = new THREE.Mesh(sphere, map)
      planetBody.name = planet.name
      planetBody.userData = {
        type: 'planet'
      }
      const {x,y,z} = vertex([planet.ra*15,planet.dec])
      planetBody.position.set(x,y,z)
      linkToConstellation(planetBody)
      planets.add( planetBody )
    })
  ).then(res => {
    return planets
  })
}
//this is fake visual data
const info = {
  mercury: {
    color: 0xababab,
    size: 40,
    brightness: -1.06
  },
  venus: {
    color: 0xffed4a,
    size: 55,
    brightness: -3.9
  },
  mars: {
    color: 0xfc5603,
    size: 50,
    brightness: -0.8
  },
  jupiter: {
    color: 0x4f3e2c,
    size: 60,
    brightness: -2.0
  },
  saturn: {
    color: 0x868755,
    size: 45,
    brightness: 0.64
  },
  uranus: {
    color: 0x4ccfca,
    size: 35,
    brightness: 5.7
  },
  neptune: {
    color: 0x0088ff,
    size: 25,
    brightness: 7.8
  },
}

export default Planets