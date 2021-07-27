import * as THREE from '../lib/three.module.js'
import { celestialToCartesian, scaleMag, starColor, vertex } from "../helperfunctions.js"

const map = new THREE.TextureLoader().load('./assets/lensflare0_alpha.png')

export const starSimple = ({ci, con, dec, dist, mag, ra, name, spect}) => {
  const map = new THREE.TextureLoader().load('./assets/lensflare0_alpha.png')
  const starGeo = new THREE.BufferGeometry();
  const {x,y,z} = vertex([ra*15, dec])
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute([x,y,z], 3))
  const {r,g,b} = starColor(ci, spect)
  console.log(r,g,b, starColor(ci, spect))
  const color = new THREE.Color()
  //three expects rgb color to be in range [0,1] not 0-255 totally sucks probably should just use hex values for everything
  color.setStyle(`rgb(${r},${g},${b})`)

  console.log(color, color.getHexString())
  const starMat = new THREE.PointsMaterial({
    color: `#${color.getHexString()}`,
    size: scaleMag(mag) * 400,
    blending: THREE.AdditiveBlending,
    transparent: true,
    alphaTest: 0.7,
    alphaMap: map,
    //map: map
  })

  const star = new THREE.Points(starGeo, starMat)
  star.name = name
  return star
}

export const starShader = ({}) => {
  const starGeometry = new THREE.SphereBufferGeometry(1, 30, 30)


  const material = new THREE.ShaderMaterial({
    extensions: {
      derivatives: "#extension GL_OES_standard_derivatives: enable"
    },
    side: THREE.DoubleSide,
    uniforms: {
      time: {value: 0},
      resolution: {value: new THREE.Vector4()}
    },
    vertexShader: vertex,
    fragmentShader: fragment
  })


}