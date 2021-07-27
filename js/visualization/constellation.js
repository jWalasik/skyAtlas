import { GalaxyDB } from '../database.js'
import * as THREE from '../lib/three.module.js'

const database = new GalaxyDB()

const Constellation = (constellation) => {
  const starData = database.getData('hyg')
        asterismData = database.getData('lines')
  
  const container = new THREE.Object3D()
  container.name = `${constellation.name}-detailed`
  container.selectable = []
  window.scene.add(container)

  const background = [],
        majorStars = []

  starData.forEach(star => {
    //filter by name
    if(star.con == constellation.name) {
      console.log(star.name)
      if(!star.name) {
        background.push(star)
      } else {
        majorStars.push(star)
      }
    }
  })

}