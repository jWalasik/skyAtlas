import { GalaxyDB } from '../database.js'
import * as THREE from '../lib/three.module.js'

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
      if(!star.name) {
        stars.push(star)
      } else poi.push(star)
    }
  })


  // window.scene.getObjectByName('geometries').traverse(child => {
  //   child.visible=false
  // })
  //DESCRIPTION
}