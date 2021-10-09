import { GalaxyDB } from '../database.js'
import * as THREE from '../lib/three.module.js'
import { starSimple } from './star.js'
import { changeLevel } from '../controls/selector.js'

const database = new GalaxyDB()

export function detailedView(object) {
  const starData = database.getData('hyg')
  console.log(object)
  changeLevel('constellation')
  const scene = window.scene

  //new container object
  const geometries = new THREE.Object3D()
  geometries.name = 'constellation'
  scene.add(geometries)

  //setup stars
  const background = [], majorStars = []
  starData.forEach(star => {
    if(star.con == object.name){
      if(!star.name) {
        background.push(star)
      } else majorStars.push(star)
    }
  })

  majorStars.forEach(star => {
    const starMesh = starSimple(star)
    geometries.add(starMesh)
  })
}