import * as THREE from '../lib/three.module.js'
import { GalaxyDB } from '../database.js'
import {scaleMag, starColor, vertex} from '../helperfunctions.js'
import shaderLoader, { fetchShaders } from '../shaderLoader.js'

const database = new GalaxyDB()

const StarField = async () => {
  let geometry = new THREE.BufferGeometry(),
      vertices = [], 
      colors = [], 
      sizes = [],
      constellations = []
  const starData = database.getData('hyg')

  starData.forEach(star=>{
    const {x,y,z} = vertex([star.ra, star.dec])
    vertices.push(x,y,z)

    const [r,g,b] = starColor(star.ci, star.spect)
    colors.push(r,g,b)

    if(star.mag<2.6){
      sizes.push(scaleMag(star.mag)*2)
    } else {
      sizes.push(scaleMag(star.mag))
    }
    constellations.push(star.con)    
  })
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  //randomized twinkling
  var numVertices = geometry.attributes.position.count;
  var alphas = new Float32Array( numVertices * 1 )
  for(var i=0; i<numVertices; i++) {
    alphas[ i ] = Math.random();
  }
  geometry.addAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));

  const uniforms = {
    texture: {value: new THREE.TextureLoader().load('assets/lensflare0_alpha.png')},
    scale: {type: 'f', value: window.innerHeight/2},
    time: { type: 'f', value: 0.1 }
  };
  
  return fetchShaders('starField').then(shader=> {
    console.log(shader)
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
      alphaTest: 0.5
    })
  
    const starField = new THREE.Points(geometry, starMaterial)
    starField.name = 'starField'
  
    return starField
  })
  
}

export default StarField