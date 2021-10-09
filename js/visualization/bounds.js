import * as THREE from '../lib/three.module.js'
import { GalaxyDB } from "../database.js"
import { pairs, vertex } from '../helperfunctions.js'
import Label from './label.js'

const database = new GalaxyDB()

const Bounds = () => {
  const boundaries = new THREE.Object3D()
  boundaries.name = 'boundaries'
  const data = database.getData('boundaries')
  data.boundaries.forEach(([name, ...rest]) => {
    let faceMap = []
    const boundsGeometry = new THREE.Geometry(),  //bounds are used as 'face' to detect raycasting and highlight whole field
          outlineGeometry = new THREE.Geometry()  //outline 
    for(let i=0; i<rest.length; i+=2) {
      //consider mapping boundaries in 2d cooridinate system aswell for better view transitions
      faceMap.push(new THREE.Vector2(rest[i], rest[i+1]))
      const point = vertex([rest[i], rest[i+1]])
      boundsGeometry.vertices.push(point)
      outlineGeometry.vertices.push(point)
    }

    const outlineMaterial = new THREE.LineBasicMaterial({color: 0x0072f5})
    const outline = new THREE.Line(outlineGeometry, outlineMaterial)

    //face shape triangulation - for some reason certain constellations, triangulation works better using 3d coordinates, some prefer 2d, others break either way, might be an issue with coordinates themselves or triangulation method
    if(name.match(/(And)|(Cas)|(Cet)|(Cep)|(Dra)|(Her)|(Oct)|(Peg)|(Eri)|(Phe)|(Psc)|(UMa)|(Lyn)|(Leo)/g)) {
      const triangles = THREE.ShapeUtils.triangulateShape(boundsGeometry.vertices, [])
      triangles.forEach(([x,y,z]) => boundsGeometry.faces.push(new THREE.Face3(x,y,z)))
    } else {
      const triangles = THREE.ShapeUtils.triangulateShape(faceMap, [])
      triangles.forEach(([x,y,z]) => {
        boundsGeometry.faces.push(new THREE.Face3(x,y,z))
      })
    }
    
    const boundsMaterial = new THREE.MeshBasicMaterial({color: 0x96fff7, transparent:true, opacity:0.0});
    const bounds = new THREE.Mesh(boundsGeometry, boundsMaterial)
    bounds.material.side = THREE.DoubleSide
    bounds.add(outline)
    bounds.name = name
    bounds.userData = {
      type: 'constellation',
      fullName: undefined,
      minorStars: [],
      majorStars: [],
      linkedObjects: new Set([]), //string refrences for planets, messier objects and other bodies that might temporary appear in constellation
      asterism: undefined
    }
    window.scene.selectable.galaxy.push(bounds)
    boundaries.add(bounds)
  })
  return boundaries
}

export default Bounds