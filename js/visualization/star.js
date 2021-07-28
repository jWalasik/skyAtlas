import * as THREE from '../lib/three.module.js'
import { celestialToCartesian, scaleMag, starColor, vertex } from "../helperfunctions.js"

const map = new THREE.TextureLoader().load('./assets/lensflare0_alpha.png')

export const starSimple = ({ci, con, dec, dist, mag, ra, name, spect}) => {
  console.log(name)
  const starGeo = new THREE.BufferGeometry();
  const {x,y,z} = vertex([ra*15, dec])
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute([x,y,z], 3))
  const {r,g,b} = starColor(ci, spect)

  const color = new THREE.Color()
  //three expects rgb color to be in range [0,1] not 0-255 totally sucks probably should just use hex values for everything
  color.setStyle(`rgb(${r},${g},${b})`)

  const starMat = new THREE.PointsMaterial({
    color: `#${color.getHexString()}`,
    size: scaleMag(mag) * 400,
    blending: THREE.AdditiveBlending,
    transparent: true,
    map: map
  })

  const star = new THREE.Points(starGeo, starMat)
  star.name = name
  return star
}