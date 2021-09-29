import * as THREE from '../lib/three.module.js'
import { GalaxyDB } from '../database.js'
import {scaleMag, starColor, vertex} from '../helperfunctions.js'

const database = new GalaxyDB()

const StarField = (constellation) => {
  let geometry = new THREE.BufferGeometry(),
      vertices = [], 
      colors = [], 
      sizes = [],
      constellations = {}
      
  const starData = !constellation ? database.getData('hyg') : constellation

  starData.forEach(star=>{
    const {x,y,z} = vertex([star.ra*15, star.dec])
    vertices.push(x,y,z)
    
    const {r,g,b} = starColor(star.ci, star.spect)
    const color = new THREE.Color(`rgb(${r},${g},${b})`)    
    colors.push(color.r,color.g,color.b)
    sizes.push(scaleMag(star.mag))
    let abbrv
    abbrv = (star.con && star.con !== '') ? star.con : 'unknown'
    constellations[abbrv] ? constellations[abbrv].push(star) : constellations[abbrv] = [star]
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
    texture: {type: 't', value: new THREE.TextureLoader().load('./assets/lensflare0_alpha.png')},
    scale: {type: 'f', value: 235}, 
    time: {type: 'f', value: 0.1 }
  };

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
    alphaTest: 0.5
  })

  const starField = new THREE.Points(geometry, starMaterial)

  starField.name = 'starField'

  //idle callback does not work on iOS based devices, if unsupported process stars immediately otherwise wait for all geometries to load
  if(typeof(window.requestIdleCallback) != 'undefined') {
    window.requestIdleCallback(() => sortStars())
  } else sortStars()

  //links each star with appropritate constellation for easier interaction handling
  const sortStars = () => {
    Object.entries(constellations).forEach(con => {
      //around 1600 stars with magnitude 12+ has no corresponding constellation
      if(con[0] === 'unknown') return
      let bounds
      //serpens constellation is divided into two fields, need to link both
      if(con[0] === "Ser") {
        bounds = [window.scene.getObjectByName('Ser1'), window.scene.getObjectByName('Ser2')]
        con[1].forEach(star => {
          if(star.name !== "") {
            bounds[0].userData.majorStars.push(star)
            bounds[1].userData.majorStars.push(star)
          } else {
            bounds[0].userData.minorStars.push(star)
            bounds[1].userData.minorStars.push(star)
          }
        })
      } else {
        bounds = window.scene.getObjectByName(con[0])
        con[1].forEach(star => {
          if(star.name !== "") {
            bounds.userData.majorStars.push(star)
          } else {
            bounds.userData.minorStars.push(star)
          }
        })
      }
    })
  }

  return starField  
}

/*
  Since shaders are not shared between modules they are stored as a multiline string inside of its corresponding module as oposed to external file.
  This approach doesnt require async file loading but sacrifice shader syntax highlighting
*/
const fragmentShader = `
  uniform sampler2D texture;
  uniform float time;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4( vColor * (1.0 - (sin(time*vAlpha))*0.3) , 1 );
    gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
  }
`

const vertexShader = `
  uniform float scale;
  attribute float size;
  attribute float alpha;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size*(120.0) * ((scale / -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`

export default StarField