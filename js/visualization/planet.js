import { cameraLock } from '../controls/selector.js'
import * as THREE from '../lib/three.module.js'
import { getWikiData } from '../utils/wikiLookup.js'

export const Planet = async (data) => {
  const sphere = new THREE.SphereGeometry(150, 64, 64)
  const material = new THREE.MeshBasicMaterial({
    map: await new THREE.TextureLoader().load(`./assets/bodies/${data.name}-map.jpg`),
    opacity: 1.0,

  })

  const planet = new THREE.Mesh(sphere, material)
  planet.layers.set(1)

  if(data.name === 'saturn') {
    const texture = new THREE.TextureLoader().load('./assets/bodies/saturn-ring.png')

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      color: 0xffffff,
      transparent: true
    });
  
    const geometry = new THREE.RingBufferGeometry(180, 350, 64);
    var pos = geometry.attributes.position;
    var v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < 200 ? 0 : 1, 1);
    }
  
    const ring = new THREE.Mesh(geometry, material)
    ring.rotation.x = Math.PI/2
    ring.layers.set(1)
    planet.add(ring)
  }

  document.getElementById('controls-name').innerText = data.name

  const wikiHref = data.name.replace(/ /g, '_') + '_(planet)'
  getWikiData(wikiHref)
    .then(res => {
      const description = document.getElementById('controls-description')
      description.innerHTML = res.query.pages[0].extract || 'Sorry! We could not find relevant wikipedia entry regarding this object :('  
    })
    .catch(err => console.log(err))

  window.scene.add(planet)
  cameraLock(false)
}