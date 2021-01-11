import { GalaxyDB } from '../database.js'
import { vertex2D } from '../helperfunctions.js'
import * as THREE from '../lib/three.module.js'
import StarField from './starField.js'

const database = new GalaxyDB()

export function detailedView(object) {
  console.log(object)
  const starData = database.getData('hyg')
  const container = new THREE.Object3D()
  container.name = object.name + 'detailed'
  //hide basic geometries
  //prevent camera movements

  //POINTS OF INTEREST
  const poi = [...object.userData.linkedObjects]

  //COMPUTE GEOMETRY
  //extract stars
  const stars = [] 
  starData.forEach(star => {
    if(star.con == object.name){
      if(!star.proper) {
        stars.push(star)
      } else poi.push(star)
    }
  })
  const background = StarField(stars)

  container.add(background)
  console.log(poi, object.userData)
  window.scene.add(container)

  window.scene.getObjectByName('geometries').traverse(child => {
    child.visible=false
  })
  //DESCRIPTION
}