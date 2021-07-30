import * as THREE from '../lib/three.module.js'

import Asterisms from './asterisms.js'
import Bounds from './bounds.js'
import Graticule from './graticule.js'
import StarField from './starField.js'
import Planets from './planets.js'

import {animateObject, Object} from './object.js'

const Galaxy = () => {
  const container = new THREE.Object3D()
  container.name = 'galaxy'
  window.scene.add(container)

  //GEOMETRIES
  console.time('geometries')
  const graticule = Graticule()
  container.add( graticule )
  
  const boundaries = Bounds()
  container.add( boundaries )

  const asterisms = Asterisms()
  container.add( asterisms )
  
  const starField = StarField()
  container.add( starField )
    
  //promise due to async texture loader
  Planets().then(planets => {
    container.add( planets )
  })

  console.time('geometries')

  const object = Object('Betelgeuse', 'star')
  container.add(object.surface)
  container.add(object.corona)

  //return container
}

export default Galaxy