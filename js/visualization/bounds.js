import * as THREE from '../lib/three.module.js'
import { GalaxyDB } from "../database.js"
import { pairs, vertex } from '../helperfunctions.js'
import Label from './label.js'

const database = new GalaxyDB()

const Bounds = () => {
  const boundaries = new THREE.Object3D()
  boundaries.name = 'boundaries'
  const data = database.getData('bounds')
  data.boundaries.forEach(([name, ...rest]) => {
    const boundsGeometry = new THREE.Geometry(),  //bounds are used as 'face' to detect raycasting and highlight whole field
          outlineGeometry = new THREE.Geometry()  //outline 
    for(let i=0; i<rest.length; i+=2) {
      //consider mapping boundaries in 2d cooridinate system aswell for better view transitions
      const point = vertex([rest[i], rest[i+1]])
      boundsGeometry.vertices.push(point)
      outlineGeometry.vertices.push(point)
    }

    const outlineMaterial = new THREE.LineBasicMaterial({color: 0x3d7691})
    const outline = new THREE.Line(outlineGeometry, outlineMaterial)

    //face shape triangulation
    const triangles = THREE.ShapeUtils.triangulateShape(boundsGeometry.vertices, [])
    triangles.forEach(([x,y,z]) => boundsGeometry.faces.push(new THREE.Face3(x,y,z)))
    
    const boundsMaterial = new THREE.MeshBasicMaterial({color: 0x96fff7, transparent:true, opacity:0.0});
    const bounds = new THREE.Mesh(boundsGeometry, boundsMaterial)
    bounds.material.side = THREE.DoubleSide
    bounds.add(outline)
    bounds.name = name
    
    boundaries.add(bounds)
  })
  return boundaries
}

export default Bounds