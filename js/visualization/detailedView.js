import { GalaxyDB } from '../database.js'
import * as THREE from '../lib/three.module.js'
import { starSimple } from './star.js'
import { changeLevel } from '../controls/selector.js'
import { celestialToCartesian } from '../helperfunctions.js'

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

// export function detailedView(object) {
//   const starData = database.getData('hyg')
//   const scene = new THREE.Scene()
//   scene.name = 'constellation'
//   const container = new THREE.Object3D()
//   container.name = object.name + '-detailed'
//   //hide basic geometries
//   //prevent camera movements

//   //POINTS OF INTEREST
//   const poi = []
//   const planets = object.userData.linkedObjects
//   //COMPUTE GEOMETRY
//   //extract stars
//   const stars = [] 
//   starData.forEach(star => {
//     if(star.con == object.name){
//       if(!star.name) {
//         stars.push(star)
//       } else poi.push(star)
//     }
//   })
//   poi.forEach(star => {
//     container.add(starSimple(star))
//   })
//   console.log(poi, planets)
//   const geometries = window.scene.getObjectByName('geometries')
//   console.log(geometries)
//   //geometries.visible = false

//   //window.scene.add(container)
//   // window.scene.getObjectByName('geometries').traverse(child => {
//   //   child.visible=false
//   // })
//   //DESCRIPTION
// }