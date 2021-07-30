import { GalaxyDB } from '../database.js'
import { pairs, vertex } from '../helperfunctions.js'
import * as THREE from '../lib/three.module.js'
import Label from './label.js'

const database = new GalaxyDB()

const Asterisms = () => {
  const asterisms = new THREE.Object3D()
  asterisms.name = 'asterisms'
  const data = database.getData('lines')

  data.features.forEach(({id:[abbrv, fullName], geometry}) => {
    let asterism = new THREE.Object3D()
    asterism.name = fullName
    //link asterism to constellation for easier event handling
    const boundary = window.scene.getObjectByName(abbrv).userData
    boundary.asterism = asterism
    boundary.fullName = fullName
    //lines are separated to prevent connecting incorrect points
    geometry.coordinates.forEach(path => {
      let lineGeometry = new THREE.Geometry()
      path.forEach(coord=> {
        const point = vertex(coord)
        lineGeometry.vertices.push(point)
      })
      const lineMaterial = new THREE.LineBasicMaterial({color: 0x28c4c9})
      const line = new THREE.Line(lineGeometry, lineMaterial)
      asterism.add(line)
    })
    asterisms.add( asterism )
  })
  
  return asterisms
}

export default Asterisms